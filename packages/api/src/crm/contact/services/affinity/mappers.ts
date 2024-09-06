import {
    UnifiedCrmContactInput,
    UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { AffinityContactInput, AffinityContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class AffinityContactMapper implements IContactMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'contact', 'affinity', this);
    }

    async desunify(
        source: UnifiedCrmContactInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<AffinityContactInput> {
        // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry


        const result: AffinityContactInput = {
            first_name: source.first_name,
            last_name: source.last_name,
            emails: source.email_addresses?.map((e) => e.email_address),
        };

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
        source: AffinityContactOutput | AffinityContactOutput[],
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
        contact: AffinityContactOutput,
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

        const opts: any = {};

        return {
            remote_id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            // user_id: contact.values.created_by[0]?.referenced_actor_id,
            email_addresses: contact.emails?.map((e) => ({
                email_address: e,
                email_address_type: '',
            })), // Map each email
            //   phone_numbers: contact.values.phone_numbers?.map((p) => ({
            //     phone_number: p.original_phone_number,
            //     phone_type: p.attribute_type ? p.attribute_type : '',
            //   })), // Map each phone number,
            field_mappings,
            //   addresses: [address],
            ...opts,
        };
    }
}
