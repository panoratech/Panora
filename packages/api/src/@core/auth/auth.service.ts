import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';
import { LoginDto } from './dto/login.dto';
import { VerifyUserDto } from './dto/verify-user.dto';

//TODO: Ensure the JWT is used for user session authentication and that it's short-lived.
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async getUsers() {
    try {
      return await this.prisma.users.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  async verifyUser(verifyUser: VerifyUserDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id_user: verifyUser.id_user,
        },
      });

      if (!user) {
        throw new UnauthorizedException('user does not exist!');
      }

      return verifyUser;

      // const projects = await this.prisma.projects.findMany({
      //   where: {
      //     id_user: user.id_user,
      //   },
      // });
      // return {
      //   ...user,
      //   projects: projects,
      // };
    } catch (error) {
      handleServiceError(error, this.logger);
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
      handleServiceError(error, this.logger);
    }
  }

  async register(user: CreateUserDto) {
    try {
      const foundUser = await this.prisma.users.findFirst({
        where: { email: user.email },
      });

      if (foundUser) {
        throw new BadRequestException('Email is already exists!!');
      }

      return await this.createUser(user);
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createUser(user: CreateUserDto, id_user?: string) {
    try {
      const hashedPassword = await bcrypt.hash(user.password_hash, 10);
      const user_ = await this.prisma.users.create({
        data: {
          // ...user,
          id_user: id_user || uuidv4(),
          password_hash: hashedPassword,
          identification_strategy: 'b2c',
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: new Date(),
        },
      });
      const proj = await this.prisma.projects.create({
        data: {
          id_project: uuidv4(),
          name: 'Project 1',
          sync_mode: '',
          id_user: user_.id_user,
        },
      });
      this.logger.log('Proj data after registr is ' + JSON.stringify(proj));
      return user_;
    } catch (error) {
      console.log(error);
      handleServiceError(error, this.logger);
    }
  }

  async login(user: LoginDto) {
    try {
      const foundUser = await this.prisma.users.findFirst({
        where: {
          email: user.email,
        },
      });

      const project = await this.prisma.projects.findFirst({
        where: {
          id_user: foundUser.id_user,
        },
      });
      this.logger.log('Project found (login) is ' + JSON.stringify(project));

      if (!foundUser) {
        throw new UnauthorizedException('user does not exist!');
      }

      const isEq = await bcrypt.compare(
        user.password_hash,
        foundUser.password_hash,
      );

      if (!isEq) throw new UnauthorizedException('Invalid credentials.');

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
      handleServiceError(error, this.logger);
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
      handleServiceError(error, this.logger);
    }
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  //must be called only if user is logged in
  async generateApiKey(
    projectId: number | string,
    userId: number | string,
  ): Promise<{ access_token: string }> {
    try {
      const jwtPayload = {
        sub: userId,
        projectId: projectId,
      };
      return {
        access_token: this.jwtService.sign(jwtPayload, {
          secret: process.env.JWT_SECRET,
          expiresIn: '1y',
        }),
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async generateApiKeyForUser(
    userId: string,
    projectId: string,
    keyName: string,
  ): Promise<{ api_key: string }> {
    try {
      const foundProject = await this.prisma.projects.findUnique({
        where: { id_project: projectId },
      });
      if (!foundProject) {
        throw new UnauthorizedException(
          'project not found inside api key function generation',
        );
      }
      const foundUser = await this.prisma.users.findUnique({
        where: { id_user: userId },
      });
      if (!foundUser) {
        throw new UnauthorizedException(
          'user not found inside api key function generation',
        );
      }

      /*if (foundProject.id_organization !== foundUser.id_organization) {
        throw new Error('User is not inside the project');
      }*/
      // Generate a new API key (use a secure method for generation)
      const { access_token } = await this.generateApiKey(projectId, userId);
      // Store the API key in the database associated with the user
      //const hashed_token = this.hashApiKey(access_token);
      const new_api_key = await this.prisma.api_keys.create({
        data: {
          id_api_key: uuidv4(),
          api_key_hash: access_token,
          name: keyName,
          id_project: projectId as string,
          id_user: userId as string,
        },
      });
      if (!new_api_key) {
        throw new UnauthorizedException('api keys issue to add to db');
      }

      return { api_key: access_token, ...new_api_key };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Decode the JWT to verify if it's valid and get the payload
      const decoded = this.jwtService.verify(apiKey, {
        secret: process.env.JWT_SECRET,
      });

      //const hashed_api_key = this.hashApiKey(apiKey);
      const saved_api_key = await this.prisma.api_keys.findUnique({
        where: {
          api_key_hash: apiKey,
        },
      });
      if (!saved_api_key) {
        throw new UnauthorizedException('Failed to fetch API key from DB');
      }
      if (String(decoded.projectId) !== String(saved_api_key.id_project)) {
        throw new UnauthorizedException(
          'Failed to validate API key: projectId invalid.',
        );
      }

      // Validate that the JWT payload matches the provided userId and projectId
      if (String(decoded.sub) !== String(saved_api_key.id_user)) {
        throw new UnauthorizedException(
          'Failed to validate API key: userId invalid.',
        );
      }
      return true;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
