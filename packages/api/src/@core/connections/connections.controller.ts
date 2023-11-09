import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CreateConnectionDtoOauth } from './dto/create-connection.dto';

@Controller('connections')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('oauth/callback')
  handleCallback(
    @Query('projectId') projectId: string,
    @Query('customerId') customerId: string,
    @Query('providerName') providerName: string,
    @Query('returnUrl') returnUrl: string,
    @Query('code') hubspotCode?: string,
  ) {
    //TODO; ADD VERIFICATION OF PARAMS

    try {
      //switch case to know the provider whether it needs query params
      switch (providerName) {
        case 'hubspot':
          //ensure there's an hubspot code
          if (!hubspotCode) {
            throw new Error('no hubspot code found');
          }
          return this.connectionsService.handleHubspotCallback(
            customerId,
            providerName,
            projectId,
            returnUrl,
            hubspotCode,
          );
        case 'default':
          return;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  /*@Get()
  findAll() {
    return this.connectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.connectionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConnectionDto: UpdateConnectionDto) {
    return this.connectionsService.update(+id, updateConnectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectionsService.remove(+id);
  }*/
}
