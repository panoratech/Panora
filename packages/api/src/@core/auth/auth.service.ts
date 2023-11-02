import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginCredentials } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiKey } from './types';

//TODO: Ensure the JWT is used for user session authentication and that it's short-lived.
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(user: CreateUserDto) {
    try {
      // Generate a salt and hash the password
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(user.password_hash, salt);

      const res = await this.prisma.users.create({
        data: {
          email: user.email,
          password_hash: hashedPassword,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
      if (!res) {
        throw new UnauthorizedException('registering issue');
      }
      const { password_hash, ...resp_user } = res;
      return resp_user;
    } catch (error) {
      console.log(error);
    }
  }

  async login(user: LoginCredentials): Promise<{ access_token: string }> {
    try {
      const foundUser = await this.prisma.users.findUnique({
        where: { email: user.email },
      });
      //TODO: if not founder
      if (
        foundUser &&
        (await bcrypt.compare(user.password_hash, foundUser.password_hash))
      ) {
        const { password_hash, ...result } = user;

        if (!result) {
          throw new UnauthorizedException('Invalid credentials.');
        }
      }
      const payload = {
        email: foundUser.email,
        sub: foundUser.id_user,
      };

      return {
        access_token: this.jwtService.sign(payload), // token used to generate api keys
      };
    } catch (error) {
      console.log(error);
    }
  }

  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  async generateApiKey1(projectId: number): Promise<string> {
    const api_key = 'PROD_' + crypto.randomUUID();

    // Store the API key in the database associated with the user
    const new_api_key = await this.prisma.api_keys.create({
      data: {
        api_key_hash: this.hashApiKey(api_key),
        id_project: projectId,
      },
    });
    return api_key;
  }

  async validateApiKey1(apiKey: string): Promise<boolean> {
    const hash = this.hashApiKey(apiKey);
    const api_key = await this.prisma.api_keys.findUnique({
      where: {
        api_key_hash: hash,
      },
    });
    return Boolean(api_key);
  }

  /*async generateApiKey(
    projectId: number,
    api_key_name: string,
    api_key_id: string,
  ): Promise<ApiKey> {
    const secret = process.env.TOKEN_API_SECRET;
    const jwtPayload = {
      sub: projectId,
    };
    return {
      projectId,
      api_key_name,
      token: this.jwtService.sign(jwtPayload, {
        secret,
        jwtid: api_key_id,
      }),
    };
  }

  async generateApiKeyForUser(
    userId: number,
    projectId: number,
    api_name: string,
  ): Promise<ApiKey> {
    try {
      //fetch user_id
      const foundUser = await this.prisma.users.findUnique({
        where: { id_user: userId },
      });
      if (!foundUser) {
        throw new UnauthorizedException(
          'user not found inside api key function generation',
        );
      }

      // Store the API key in the database associated with the user
      const new_api_key = await this.prisma.api_keys.create({
        data: {
          api_name: api_name, // TODO : error
          id_project: foundUser.id_project, // TODO : error
        },
      });

      if (!new_api_key) {
        throw new UnauthorizedException('api keys issue to add to db');
      }

      // Generate a new API key (use a secure method for generation)
      const key = await this.generateApiKey(
        projectId,
        api_name,
        new_api_key.id_api_key as string,
      );

      return key;
    } catch (error) {}
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // TODO: CONFIRM its valid
      const decoded = this.jwtService.decode(apiKey) as any;
      this.jwtService.verify(apiKey, {
        secret: process.env.TOKEN_API_SECRET,
      });

      const userApiKey = await this.prisma.api_keys.findUnique({
        where: {
          id_api_key: parseInt(decoded.jwtid), // Use jwtid from the decoded token to find the API key
        },
        include: {
          users: true,
        },
      });

      if (!userApiKey) throw new Error('API key not found.');

      // Instead of comparing the API key, we check if the jwtid from the token matches an entry in the database
      if (decoded.jwtid !== userApiKey.id_api_key.toString())
        throw new Error('Invalid API key.');
      return true;
    } catch (error) {
      console.error('validateApiKey error:', error);
      throw new UnauthorizedException('Failed to validate API key.');
    }
  }*/
}
