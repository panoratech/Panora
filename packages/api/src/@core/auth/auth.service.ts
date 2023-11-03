import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginCredentials } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

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
        where: { id_user: user.id_user },
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
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }), // token used to generate api keys
      };
    } catch (error) {
      console.log(error);
    }
  }

  hashApiKey(apiKey: string): string {
    console.log('hey hashing...');
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /*hashApiKey(apiKey: string): string {
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
  }*/

  async generateApiKey(
    projectId: number,
    userId: number,
  ): Promise<{ access_token: string }> {
    console.log("'ddddd");
    const secret = process.env.JWT_SECRET;
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
  }

  async generateApiKeyForUser(
    userId: number,
    projectId: number,
  ): Promise<{ api_key: string }> {
    try {
      console.log('here is my userId ', userId);
      //tmp:
      const resp = await this.prisma.organizations.create({
        data: {
          name: 'org1',
          stripe_customer_id: 'oneone',
        },
      });
      await this.prisma.projects.create({
        data: {
          name: 'proj',
          id_organization: resp.id_organization,
        },
      });
      //TODO: CHECK IF PROJECT_ID IS EXISTENT
      //fetch user_id
      const foundUser = await this.prisma.users.findUnique({
        where: { id_user: userId },
      });
      if (!foundUser) {
        throw new UnauthorizedException(
          'user not found inside api key function generation',
        );
      }
      //TODO: check if user is indeed inside the project

      // Generate a new API key (use a secure method for generation)
      const { access_token } = await this.generateApiKey(projectId, userId);
      console.log('hey');
      // Store the API key in the database associated with the user
      const hashed_token = this.hashApiKey(access_token);
      console.log('hey2');
      const new_api_key = await this.prisma.api_keys.create({
        data: {
          api_key_hash: hashed_token,
          id_project: projectId,
          id_user: userId,
        },
      });
      if (!new_api_key) {
        throw new UnauthorizedException('api keys issue to add to db');
      }
      console.log('.....');

      return { api_key: access_token };
    } catch (error) {
      console.log(error);
    }
  }

  async validateApiKey(apiKey: string, userId: number): Promise<boolean> {
    try {
      // Decode the JWT to verify if it's valid and get the payload
      const decoded = this.jwtService.verify(apiKey, {
        secret: process.env.API_KEY_SECRET,
      });

      const hashed_api_key = this.hashApiKey(apiKey);
      const saved_api_key = await this.prisma.api_keys.findUnique({
        where: {
          api_key_hash: hashed_api_key,
        },
      });
      if (!saved_api_key) {
        throw new UnauthorizedException('Failed to fetch API key from DB');
      }

      if (decoded.projectId !== saved_api_key.id_project) {
        throw new UnauthorizedException(
          'Failed to validate API key: projectId invalid.',
        );
      }

      // Validate that the JWT payload matches the provided userId and projectId
      if (decoded.sub !== userId) {
        throw new UnauthorizedException(
          'Failed to validate API key: userId invalid.',
        );
      }
      return true;
    } catch (error) {
      console.error('validateApiKey error:', error);
      throw new UnauthorizedException('Failed to validate API key.');
    }
  }
}
