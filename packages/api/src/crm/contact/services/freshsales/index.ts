/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactDto } from '../../dto/create-contact.dto';
import { ApiResponse } from '../../types';
import { FreshSales_ContactCreated } from './types';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class FreshSalesService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<FreshSales_ContactCreated>> {
    const mobile = createContactDto.phone_numbers[0];
    const url = 'https://domain.freshsales.io/api/contacts';
    const data = {
      contact: {
        first_name: createContactDto.first_name,
        last_name: createContactDto.last_name,
        mobile_number: mobile,
      },
    };
    const token = process.env.FRESHSALES_API_KEY;
    const headers = {
      Authorization: `Token token=${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response: AxiosResponse<FreshSales_ContactCreated> =
        await axios.post(url, data, { headers: headers });
      console.log(response.data);
      return {
        data: response.data,
        message: 'Contact created successfully.',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      const status: number = error.response
        ? error.response.status
        : HttpStatus.INTERNAL_SERVER_ERROR;
      return {
        data: null,
        error: error.message,
        message: 'Failed to create contact.',
        statusCode: status,
      };
    }
  }
}
