import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedScoreCardOutput } from '../types/model.unified';

@Injectable()
export class ScoreCardService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ScoreCardService.name);
  }

  async getScoreCard(
    id_ats_scorecard: string,
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
        application_id: scorecard.application_id,
        interview_id: scorecard.interview_id,
        remote_created_at: scorecard.remote_created_at,
        submitted_at: scorecard.submitted_at,
        field_mappings: field_mappings,
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

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getScoreCards(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedScoreCardOutput[]> {
    try {
      const scorecards = await this.prisma.ats_scorecards.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

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
            application_id: scorecard.application_id,
            interview_id: scorecard.interview_id,
            remote_created_at: scorecard.remote_created_at,
            submitted_at: scorecard.submitted_at,
            field_mappings: field_mappings,
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

      return res;
    } catch (error) {
      throw error;
    }
  }
}
