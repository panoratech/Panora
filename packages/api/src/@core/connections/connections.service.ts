import { Injectable } from '@nestjs/common';
import { CreateConnectionDto } from './dto/create-connection.dto';
import { UpdateConnectionDto } from './dto/update-connection.dto';

@Injectable()
export class ConnectionsService {
  //TODO; create a callback oauth endpoint so when end-user validates oauth flow
  // we catch the tmp token and swap it against oauth2 server for access/refresh tokens
  // to perform actions on his behalf
  // this call pass 1. integrationID 2. CustomerId 3. Panora Api Key

  create(createConnectionDto: CreateConnectionDto) {
    return 'This action adds a new connection';
  }

  findAll() {
    return `This action returns all connections`;
  }

  findOne(id: number) {
    return `This action returns a #${id} connection`;
  }

  update(id: number, updateConnectionDto: UpdateConnectionDto) {
    return `This action updates a #${id} connection`;
  }

  remove(id: number) {
    return `This action removes a #${id} connection`;
  }
}
