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
import { users as User } from '@prisma/client';

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
  async getUserByStytchId(stytchId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id_stytch: stytchId,
          identification_strategy: 'b2c',
        },
      });
      const projects = await this.prisma.projects.findMany({
        where: {
          id_user: user.id_user,
        },
      });
      return {
        ...user,
        projects: projects,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getApiKeys() {
    try {
      return await this.prisma.api_keys.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async register(user: CreateUserDto) {
    try {
      /*const foundUser = await this.prisma.users.findFirst({
        where: { email: user.email },
      });

      if (foundUser) {
        throw new BadRequestException('email already exists');
      }

      const savedUser = await this.createUser(user);

      const { password_hash, ...resp_user } = savedUser;
      return resp_user;*/
      return;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createUser(user: CreateUserDto, id_user?: string) {
    try {
      /*const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password_hash, salt);

      return await this.prisma.users.create({
        data: {
          ...user,
          id_user: id_user || uuidv4(),
          password_hash: hashedPassword,
        },
      });*/
      return await this.prisma.users.upsert({
        where: {
          id_stytch: user.stytch_id_user,
        },
        update: {
          identification_strategy: 'b2c',
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password_hash: '',
          created_at: new Date(),
          id_user: id_user || uuidv4(),
        },
        create: {
          id_stytch: user.stytch_id_user,
          identification_strategy: 'b2c',
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          password_hash: '',
          created_at: new Date(),
          id_user: id_user || uuidv4(),
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //TODO
  async login(user: LoginDto) {
    try {
      let foundUser: User;

      if (user.id_user) {
        foundUser = await this.prisma.users.findUnique({
          where: { id_user: user.id_user },
        });
      }

      if (!foundUser && user.email) {
        foundUser = await this.prisma.users.findFirst({
          where: { email: user.email },
        });
      }

      if (!foundUser) {
        throw new UnauthorizedException('user not found inside login function');
      }

      //TODO:
      /*const isEq = await bcrypt.compare(
        user.password_hash,
        foundUser.password_hash,
      );

      if (!isEq) throw new UnauthorizedException('Invalid credentials.');
      */
      const { password_hash, ...userData } = foundUser;

      const payload = {
        email: userData.email,
        sub: userData.id_user,
      };

      return {
        user: userData,
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }), // token used to generate api keys
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
