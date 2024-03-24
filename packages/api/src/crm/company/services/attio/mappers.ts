import { AttioCompanyInput, AttioCompanyOutput } from '@crm/@utils/@types';
import {
    UnifiedCompanyInput,
    UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/deal/utils';

export class AttioCompanyMapper implements ICompanyMapper {
    private readonly utils: Utils;

    constructor() {
        this.utils = new Utils();
    }
    async desunify(
        source: UnifiedCompanyInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<AttioCompanyInput> {
        const result: AttioCompanyInput = {
            values: {
                name: [{
                    value: source.name
                }],
                categories: [{
                    option: source.industry
                }]
            }
        }
        // const result: AttioCompanyInput = {
        //   city: '',
        //   name: source.name,
        //   phone: '',
        //   state: '',
        //   domain: '',
        //   industry: source.industry,
        // };

        // Assuming 'phone_numbers' array contains at least one phone number
        // const primaryPhone = source.phone_numbers?.[0]?.phone_number;
        // if (primaryPhone) {
        //   result.values = primaryPhone;
        // }
        if (source.addresses) {
            const address = source.addresses[0];
            if (address) {
                // result.city = address.city;
                // result.state = address.state;
                result.values.primary_location = [{
                    locality: address.city,
                    line_1: address.street_1,
                    line_2: address.street_2,
                    line_3: null,
                    line_4: null,
                    region: address.state + "," + address.country,
                    postcode: address.postal_code,
                    latitude: null,
                    longitude: null,
                    country_code: null,
                }]
            }
        }

        if (source.user_id) {
            const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
            if (owner_id) {
                result.values.team = [{
                    target_object: 'people',
                    target_record_id: owner_id,
                }];
            }
        }

        // Attio company does not have attribute for email address
        // Attio Company doest not have direct mapping of number of employees



        if (customFieldMappings && source.field_mappings) {
            for (const fieldMapping of source.field_mappings) {
                for (const key in fieldMapping) {
                    const mapping = customFieldMappings.find(
                        (mapping) => mapping.slug === key,
                    );
                    if (mapping) {
                        result.values[mapping.remote_id] = fieldMapping[key];
                    }
                }
            }
        }

        return result;
    }

    async unify(
        source: AttioCompanyOutput | AttioCompanyOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
        if (!Array.isArray(source)) {
            return this.mapSingleCompanyToUnified(source, customFieldMappings);
        }
        // Handling array of AttioCompanyOutput
        return Promise.all(
            source.map((company) =>
                this.mapSingleCompanyToUnified(company, customFieldMappings),
            ),
        );
    }

    private async mapSingleCompanyToUnified(
        company: AttioCompanyOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCompanyOutput> {
        const field_mappings =
            customFieldMappings?.map((mapping) => ({
                [mapping.slug]: company.values[mapping.remote_id],
            })) || [];

        let opts: any = {};

        if (company.values.team[0]?.target_record_id) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                company.values.team[0].target_record_id,
                'attio',
            );
            if (owner_id) {
                opts = {
                    user_id: owner_id,
                };
            }
        }

        return {
            name: company.values.name[0]?.value,
            industry: typeof company.values.categories[0]?.option === "string" ? company.values.categories[0]?.option : company.values.categories[0]?.option.title,
            number_of_employees: 0, // Placeholder, as there's no direct mapping provided
            addresses: [
                {
                    street_1: company.values.primary_location[0]?.line_1,
                    city: company.values.primary_location[0]?.locality,
                    state: company.values.primary_location[0]?.region,
                    postal_code: company.values.primary_location[0]?.postcode,
                    country: company.values.primary_location[0]?.country_code,
                    address_type: 'primary',
                    owner_type: 'company',
                },
            ], // Assuming 'street', 'city', 'state', 'postal_code', 'country' are properties in company.properties
            phone_numbers: [
                {
                    phone_number: '',
                    phone_type: 'primary',
                    owner_type: 'company',
                },
            ],
            field_mappings,
            ...opts,
        };
    }
}
