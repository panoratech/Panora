import { Controller, Query, Get, Param, Headers } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { TeamService } from './services/team.service';

@ApiTags('ticketing/team')
@Controller('ticketing/team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TeamController.name);
  }

  @ApiOperation({
    operationId: 'getTeams',
    summary: 'List a batch of Teams',
  })
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TeamResponse)
  @Get()
  getTeams(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.teamService.getTeams(integrationId, linkedUserId, remote_data);
  }

  @ApiOperation({
    operationId: 'getTeam',
    summary: 'Retrieve a Team',
    description: 'Retrieve a team from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the team you want to retrieve.',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TeamResponse)
  @Get(':id')
  getTeam(@Param('id') id: string, @Query('remoteData') remote_data?: boolean) {
    return this.teamService.getTeam(id, remote_data);
  }
}
