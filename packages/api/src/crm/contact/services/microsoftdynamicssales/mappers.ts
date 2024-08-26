import {
    UnifiedCrmContactInput,
    UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { MicrosoftdynamicssalesContactInput, MicrosoftdynamicssalesContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Injectable()
export class MicrosoftdynamicssalesContactMapper implements IContactMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'contact', 'microsoftdynamicssales', this);
    }

    async desunify(
        source: UnifiedCrmContactInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesContactInput> {


        const result: MicrosoftdynamicssalesContactInput = {
            firstname: source.first_name,
            lastname: source.last_name,
            fullname: `${source.first_name} ${source.last_name}`,
        };
        if (source.email_addresses[0]) {
            result.emailaddress1 = source.email_addresses[0]?.email_address;
        }
        if (source.email_addresses[1]) {
            result.emailaddress2 = source.email_addresses[1]?.email_address;
        }
        if (source.email_addresses[2]) {
            result.emailaddress2 = source.email_addresses[2]?.email_address;
        }
        if (source.addresses[0]) {
            result.address1_line1 = source.addresses[0].street_1;
            result.address1_city = source.addresses[0].city;
            result.address1_country = source.addresses[0].country;
            result.address1_stateorprovince = source.addresses[0].state;
            result.address1_postalcode = source.addresses[0].postal_code;
        }
        if (source.addresses[1]) {
            result.address2_line1 = source.addresses[1].street_1;
            result.address2_city = source.addresses[1].city;
            result.address2_country = source.addresses[1].country;
            result.address2_stateorprovince = source.addresses[1].state;
            result.address2_postalcode = source.addresses[1].postal_code;
        }
        if (source.addresses[2]) {
            result.address3_line1 = source.addresses[2].street_1;
            result.address3_city = source.addresses[2].city;
            result.address3_country = source.addresses[2].country;
            result.address3_stateorprovince = source.addresses[2].state;
            result.address3_postalcode = source.addresses[2].postal_code;
        }

        if (source.phone_numbers[0]) {
            result.telephone1 = source.phone_numbers[0].phone_number;
        }
        if (source.phone_numbers[1]) {
            result.telephone2 = source.phone_numbers[1].phone_number;
        }
        if (source.phone_numbers[2]) {
            result.telephone3 = source.phone_numbers[2].phone_number;
        }




        if (customFieldMappings && source.field_mappings) {
            for (const [k, v] of Object.entries(source.field_mappings)) {
                const mapping = customFieldMappings.find(
                    (mapping) => mapping.slug === k,
                );
                if (mapping) {
                    result[mapping.remote_id] = v;
                }
            }
        }
        return result;
    }

    async unify(
        source: MicrosoftdynamicssalesContactOutput | MicrosoftdynamicssalesContactOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmContactOutput | UnifiedCrmContactOutput[]> {
        if (!Array.isArray(source)) {
            return await this.mapSingleContactToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }

        // Handling array of HubspotContactOutput
        return Promise.all(
            source.map((contact) =>
                this.mapSingleContactToUnified(
                    contact,
                    connectionId,
                    customFieldMappings,
                ),
            ),
        );
    }

    private async mapSingleContactToUnified(
        contact: MicrosoftdynamicssalesContactOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmContactOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = contact[mapping.remote_id];
            }
        }

        let opts: any = {
            addresses: [],
            email_addresses: [],
            phone_numbers: []
        };

        let address: any = {};

        if (contact.address1_line1) {
            address = {
                street_1: contact.address1_line1 ?? '',
                city: contact.address1_city ?? '',
                state: contact.address1_stateorprovince ?? '',
                postal_code: contact.address2_postalcode ?? '',
                country: contact.address1_country ?? '',
                address_type: 'PERSONAL',
                owner_type: 'CONTACT',
            }
            opts.addresses.push(address);
        }
        if (contact.address2_line1) {
            address = {
                street_1: contact.address2_line1 ?? '',
                city: contact.address2_city ?? '',
                state: contact.address2_stateorprovince ?? '',
                postal_code: contact.address2_postalcode ?? '',
                country: contact.address2_country ?? '',
                address_type: 'PERSONAL',
                owner_type: 'CONTACT',
            }
            opts.addresses.push(address);
        }
        if (contact.address3_line1) {
            address = {
                street_1: contact.address3_line1 ?? '',
                city: contact.address3_city ?? '',
                state: contact.address3_stateorprovince ?? '',
                postal_code: contact.address3_postalcode ?? '',
                country: contact.address3_country ?? '',
                address_type: 'PERSONAL',
                owner_type: 'CONTACT',
            }
            opts.addresses.push(address);
        }

        if (contact.emailaddress1) {
            opts.email_addresses.push({
                email_address: contact.emailaddress1,
                email_address_type: "PERSONAL"
            })
        }
        if (contact.emailaddress2) {
            opts.email_addresses.push({
                email_address: contact.emailaddress2,
                email_address_type: "PERSONAL"
            })
        }
        if (contact.emailaddress2) {
            opts.email_addresses.push({
                email_address: contact.emailaddress3,
                email_address_type: "PERSONAL"
            })
        }
        if (contact.telephone1) {
            opts.phone_numbers.push({
                phone_number: contact.telephone1,
                phone_type: "MOBILE"
            });
        }
        if (contact.telephone2) {
            opts.phone_numbers.push({
                phone_number: contact.telephone2,
                phone_type: "MOBILE"
            });
        }
        if (contact.telephone3) {
            opts.phone_numbers.push({
                phone_number: contact.telephone3,
                phone_type: "MOBILE"
            });
        }

        if (contact._createdby_value) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                contact._createdby_value,
                connectionId,
            );
            if (owner_id) {
                opts = {
                    ...opts,
                    user_id: owner_id,
                };
            }
        }

        return {
            remote_id: contact.contactid,
            remote_data: contact,
            first_name: contact.firstname ?? '',
            last_name: contact.lastname ?? '',
            field_mappings,
            ...opts,
        };
    }
}
