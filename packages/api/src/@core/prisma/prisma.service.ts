import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as net from 'net';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly host: string = process.env.POSTGRES_HOST;
  private readonly port: number = 5432;
  private readonly maxAttempts: number = 60;
  private readonly sleepInterval: number = 5000;
  private attempts = 0;

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async waitForPostgres(): Promise<void> {
    while (this.attempts < this.maxAttempts) {
      try {
        const client = new net.Socket();

        await new Promise<void>((resolve, reject) => {
          client.setTimeout(1000);

          client.connect(this.port, this.host, () => {
            console.log(`PostgreSQL port ${this.port} is available.`);
            client.end();
            resolve();
          });

          client.on('error', (err) => {
            console.log(
              `Attempt ${
                this.attempts + 1
              }: Waiting for PostgreSQL to become available on port ${
                this.port
              }...`,
            );
            client.destroy();
            reject(err);
          });
        });

        return; // Exit the function once connected
      } catch (error) {
        this.attempts++;
        if (this.attempts >= this.maxAttempts) {
          throw new Error(
            `PostgreSQL port ${this.port} is not available after ${this.maxAttempts} attempts.`,
          );
        }
        await this.sleep(this.sleepInterval);
      }
    }

    // If the loop exits without connecting, throw an error
    throw new Error(`PostgreSQL port ${this.port} was never available.`);
  }

  async onModuleInit() {
    await this.waitForPostgres();
    await this.$connect();
  }
}
