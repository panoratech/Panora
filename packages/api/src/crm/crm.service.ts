import { Injectable } from '@nestjs/common';
import { PassThroughRequestDto } from './@types';

@Injectable()
export class CrmService {
  async sendPassthroughRequest(requestParams: PassThroughRequestDto) {
    const { method, path, data, headers } = requestParams;
    //TODO: make the right call
  }
}
