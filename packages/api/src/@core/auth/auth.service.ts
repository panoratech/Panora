import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ProjectsService } from '@@core/projects/projects.service';
import { AuthError } from '@@core/utils/errors';
import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../@core-services/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ConflictException } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import * as nodemailer from 'nodemailer';
import { PostHog } from 'posthog-node'
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';

@Injectable()
export class AuthService {
  private postHogClient: PostHog;

  constructor(
    private prisma: PrismaService,
    private projectService: ProjectsService,
    private env: EnvironmentService,    
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);
    this.postHogClient = new PostHog(
      this.env.getPosthogKey(),
      { host: this.env.getPosthogHost() }
    );
  }
  

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, new_password, reset_token } = resetPasswordDto;

    // verify there is a user with corresponding email and non-expired reset token
    const checkResetRequestIsValid = await this.prisma.users.findFirst({
      where: {
        email: email,
        reset_token_expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!checkResetRequestIsValid) {
      throw new BadRequestException('Invalid email or expired request');
    }

    // Verify the reset token
    const isValidToken = await this.verifyResetToken(
      checkResetRequestIsValid.reset_token,
      reset_token,
    );

    if (!isValidToken) {
      throw new BadRequestException('Invalid reset token');
    }
    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password in the database
    const updatedPassword = await this.prisma.users.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });
    return { message: 'Password reset successfully' };
  }

  private async verifyResetToken(
    database_token: string,
    request_token: string,
  ): Promise<boolean> {
    const isValidToken = await bcrypt.compare(request_token, database_token);
    return isValidToken;
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    if (!email) {
      throw new BadRequestException('Incorrect API request');
    }

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const resetToken = uuidv4();
    const hashedResetToken = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    await this.prisma.users.update({
      where: { email },
      data: {
        reset_token: hashedResetToken,
        reset_token_expires_at: resetTokenExpiresAt,
      },
    });

    // Send email with resetToken (implementation depends on your email service)
    await this.sendResetEmail(email, resetToken);
    return { message: 'Password reset link sent' };
  }

  private async sendResetEmail(email: string, resetToken: string) {
    const resetLink = `${process.env.WEBAPP_URL}/b2c/login/reset-password?token=${resetToken}&email=${email}`;

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      //secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_SENDING_ADDRESS}`,
      to: email,
      subject: 'Panora | Password Reset Request',
      text: `You requested a password reset. Click the following link within one hour from now to reset your password: ${resetLink}`,
      html: `<p>You requested a password reset. Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a> <p>The link will expire after one hour</p>`,
    });

    this.logger.log(`Send reset email to ${email} with token ${resetToken}`);
  }

  async verifyUser(verifyUser: VerifyUserDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id_user: verifyUser.id_user,
        },
      });

      if (!user) {
        throw new ReferenceError('User undefined!');
      }

      return verifyUser;
    } catch (error) {
      throw error;
    }
  }

  async getApiKeys(project_id: string) {
    try {
      return await this.prisma.api_keys.findMany({
        where: {
          id_project: project_id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async register(user: CreateUserDto) {
    try {
      const foundUser = await this.prisma.users.findFirst({
        where: { email: user.email },
      });

      if (foundUser) {
        throw new ConflictException(
          `Email already exists. Try resetting your password.`,
        );
      }
      return await this.createUser(user);
    } catch (error) {
      throw error;
    }
  }

  async createUser(user: CreateUserDto, id_user?: string) {
    try {
      const hashedPassword = await bcrypt.hash(user.password_hash, 10);
      const uuid_user = id_user || uuidv4();
      const user_ = await this.prisma.users.create({
        data: {
          id_user: uuid_user,
          password_hash: hashedPassword,
          identification_strategy: 'b2c',
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: new Date(),
        },
      });
      await this.projectService.createProject({
        name: 'My Project',
        id_user: user_.id_user,
      });
      // send posthog event
      if(this.env.getPhTelemetry() == "TRUE"){
        this.postHogClient.capture({
          distinctId: uuid_user,
          event: 'user signed up',
          properties: {
              login_type: 'email',
              email: user.email,
          },
      })
      }
      return user_;
    } catch (error) {
      throw error;
    }
  }

  async login(user: LoginDto) {
    try {
      const foundUser = await this.prisma.users.findFirst({
        where: {
          email: user.email,
        },
      });

      if (!foundUser) {
        throw new ReferenceError('User undefined!');
      }

      const project = await this.prisma.projects.findFirst({
        where: {
          id_user: foundUser.id_user,
        },
      });

      if (!project) {
        throw new ReferenceError('Project undefined!');
      }

      const isEq = await bcrypt.compare(
        user.password_hash,
        foundUser.password_hash,
      );

      if (!isEq)
        throw new ReferenceError(
          'Bcrypt Invalid credentials, mismatch in password.',
        );

      const { ...userData } = foundUser;

      const payload = {
        email: userData.email,
        sub: userData.id_user,
        first_name: userData.first_name,
        last_name: userData.last_name,
        id_project: project.id_project,
      };

      return {
        user: {
          id_user: foundUser.id_user,
          email: foundUser.email,
          first_name: foundUser.first_name,
          last_name: foundUser.last_name,
        },
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }), // token used to generate api keys
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(
    projectId: string,
    id_user: string,
    email: string,
    first_name: string,
    last_name: string,
  ) {
    try {
      const payload = {
        email: email,
        sub: id_user,
        first_name: first_name,
        last_name: last_name,
        id_project: projectId,
      };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  hashApiKey(apiKey: string): string {
    try {
      return crypto.createHash('sha256').update(apiKey).digest('hex');
    } catch (error) {
      throw error;
    }
  }

  //must be called only if user is logged in
  async generateApiKey(
    projectId: number | string,
    userId: number | string,
  ): Promise<{ access_token: string }> {
    try {
      const jwtPayload = {
        sub: userId,
        project_id: projectId,
      };
      return {
        access_token: this.jwtService.sign(jwtPayload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '1y',
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  async generateApiKeyForUser(
    userId: string,
    projectId: string,
    keyName: string,
  ): Promise<{ api_key: string }> {
    try {
      // Check project & User exist
      const foundProject = await this.prisma.projects.findUnique({
        where: { id_project: projectId },
      });
      if (!foundProject) {
        throw new ReferenceError('Project not found');
      }
      const foundUser = await this.prisma.users.findUnique({
        where: { id_user: userId },
      });
      if (!foundUser) {
        throw new ReferenceError('User Not Found');
      }

      /*if (foundProject.id_organization !== foundUser.id_organization) {
        throw new ReferenceError('User is not inside the project');
      }*/
      // Generate a new API key (use a secure method for generation)
      //const { access_token } = await this.generateApiKey(projectId, userId);
      // Store the API key in the database associated with the user
      //const hashed_token = this.hashApiKey(access_token);"

      const base_key = `sk_${process.env.ENV}_${uuidv4()}`;
      const hashed_key = crypto
        .createHash('sha256')
        .update(base_key)
        .digest('hex');

      const new_api_key = await this.prisma.api_keys.create({
        data: {
          id_api_key: uuidv4(),
          api_key_hash: hashed_key,
          name: keyName,
          id_project: projectId as string,
          id_user: userId as string,
        },
      });
      if (!new_api_key) {
        throw new ReferenceError('api key undefined');
      }

      return { api_key: base_key, ...new_api_key };
    } catch (error) {
      throw error;
    }
  }

  async deleteApiKey(apiKeyId: string) {
    try {
      return await this.prisma.api_keys.delete({
        where: {
          id_api_key: apiKeyId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getProjectIdForApiKey(hashed_apiKey: string) {
    try {
      const saved_api_key = await this.prisma.api_keys.findUnique({
        where: {
          api_key_hash: hashed_apiKey,
        },
      });

      return saved_api_key.id_project;
    } catch (error) {
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // TO DO : add Expiration in part 3

      // Decode the JWT to verify if it's valid and get the payload
      // const decoded = this.jwtService.verify(apiKey, {
      //   secret: process.env.JWT_SECRET,
      // });

      // pseudo-code:
      // 1 - SHA256 the API key from the header
      const hashed_key = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');

      // 2- check against DB
      // if not found, return false
      const saved_api_key = await this.prisma.api_keys.findUnique({
        where: {
          api_key_hash: hashed_key,
        },
      });

      if (!saved_api_key) {
        throw new ReferenceError('API Key not found.');
      }
      // if (String(decoded.project_id) !== String(saved_api_key.id_project)) {
      //   throw new ReferenceError(
      //     'Failed to validate API key: projectId mismatch.',
      //   );
      // }

      // // Validate that the JWT payload matches the provided userId and projectId
      // if (String(decoded.sub) !== String(saved_api_key.id_user)) {
      //   throw new ReferenceError(
      //     'Failed to validate API key: userId mismatch.',
      //   );
      // }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
