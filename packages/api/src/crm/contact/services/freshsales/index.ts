/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import axios, { AxiosResponse } from 'axios';
import {
  FreshsalesContactInput,
  FreshsalesContactOutput,
} from 'src/crm/@types';

@Injectable()
export class FreshSalesService {
  async addContact(
    contactData: FreshsalesContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesContactOutput>> {
    const mobile = contactData.phone_numbers[0];
    const url = 'https://domain.freshsales.io/api/contacts';
    const data = {
      contact: {
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        mobile_number: mobile,
      },
    };
    const token = process.env.FRESHSALES_API_KEY;
    const headers = {
      Authorization: `Token token=${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response: AxiosResponse<FreshsalesContactOutput> = await axios.post(
        url,
        data,
        { headers: headers },
      );
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
