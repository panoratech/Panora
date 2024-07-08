import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  ScoreCardRecommendation,
  UnifiedScoreCardOutput,
} from '../types/model.unified';

@Injectable()
export class ScoreCardService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ScoreCardService.name);
  }

  async getScoreCard(
    id_ats_scorecard: string,
    linkedUserId: string,
    integrationId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput> {
    try {
      const scorecard = await this.prisma.ats_scorecards.findUnique({
        where: {
          id_ats_scorecard: id_ats_scorecard,
        },
      });

      if (!scorecard) {
        throw new Error(`ScoreCard with ID ${id_ats_scorecard} not found.`);
      }

      // Fetch field mappings for the scorecard
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: scorecard.id_ats_scorecard,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedScoreCardOutput format
      const unifiedScoreCard: UnifiedScoreCardOutput = {
        id: scorecard.id_ats_scorecard,
        overall_recommendation: scorecard.overall_recommendation,
        application_id: scorecard.id_ats_application,
        interview_id: scorecard.id_ats_interview,
        remote_created_at: String(scorecard.remote_created_at),
        submitted_at: String(scorecard.submitted_at),
        field_mappings: field_mappings,
        remote_id: scorecard.remote_id,
        created_at: scorecard.created_at,
        modified_at: scorecard.modified_at,
      };

      let res: UnifiedScoreCardOutput = unifiedScoreCard;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: scorecard.id_ats_scorecard,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.scorecard.pull',
          method: 'GET',
          url: '/ats/scorecard',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getScoreCards(
    connection_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedScoreCardOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.ats_scorecards.findFirst({
          where: {
            id_connection: connection_id,
            id_ats_scorecard: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const scorecards = await this.prisma.ats_scorecards.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_ats_scorecard: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (scorecards.length === limit + 1) {
        next_cursor = Buffer.from(
          scorecards[scorecards.length - 1].id_ats_scorecard,
        ).toString('base64');
        scorecards.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedScoreCards: UnifiedScoreCardOutput[] = await Promise.all(
        scorecards.map(async (scorecard) => {
          // Fetch field mappings for the scorecard
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: scorecard.id_ats_scorecard,
              },
            },
            include: {
              attribute: true,
            },
          });

          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({
              [key]: value,
            }),
          );

          // Transform to UnifiedScoreCardOutput format
          return {
            id: scorecard.id_ats_scorecard,
            overall_recommendation: scorecard.overall_recommendation,
            application_id: scorecard.id_ats_application,
            interview_id: scorecard.id_ats_interview,
            remote_created_at: String(scorecard.remote_created_at),
            submitted_at: String(scorecard.submitted_at),
            field_mappings: field_mappings,
            remote_id: scorecard.remote_id,
            created_at: scorecard.created_at,
            modified_at: scorecard.modified_at,
          };
        }),
      );

      let res: UnifiedScoreCardOutput[] = unifiedScoreCards;

      if (remote_data) {
        const remote_array_data: UnifiedScoreCardOutput[] = await Promise.all(
          res.map(async (scorecard) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: scorecard.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...scorecard, remote_data };
          }),
        );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ats.scorecard.pull',
          method: 'GET',
          url: '/ats/scorecards',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
