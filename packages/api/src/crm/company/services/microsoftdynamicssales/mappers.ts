import { MicrosoftdynamicssalesCompanyInput, MicrosoftdynamicssalesCompanyOutput } from './types';
import {
    UnifiedCrmCompanyInput,
    UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class MicrosoftdynamicssalesCompanyMapper implements ICompanyMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'company', 'microsoftdynamicssales', this);
    }
    async desunify(
        source: UnifiedCrmCompanyInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesCompanyInput> {
        const result: MicrosoftdynamicssalesCompanyInput = {
            name: source.name,
        }

        const industryToCodeJSON = {
            "accounting": 1,
            "agriculture and non-petrol natural resource extraction": 2,
            "broadcasting printing and publishing": 3,
            "brokers": 4,
            "building supply retail": 5,
            "business services": 6,
            "consulting": 7,
            "consumer services": 8,
            "design, direction and creative management": 9,
            "distributors, dispatchers and processors": 10,
            "doctor's offices and clinics": 11,
            "durable manufacturing": 12,
            "eating and drinking places": 13,
            "entertainment retail": 14,
            "equipment rental and leasing": 15,
            "financial": 16,
            "food and tobacco processing": 17,
            "inbound capital intensive processing": 18,
            "inbound repair and services": 19,
            "insurance": 20,
            "legal services": 21,
            "non-durable merchandise retail": 22,
            "outbound consumer service": 23,
            "petrochemical extraction and distribution": 24,
            "service retail": 25,
            "sig affiliations": 26,
            "social services": 27,
            "special outbound trade contractors": 28,
            "specialty realty": 29,
            "transportation": 30,
            "utility creation and distribution": 31,
            "vehicle retail": 32,
            "wholesale": 33
        }

        if (source.industry) {
            result.industrycode = industryToCodeJSON[source.industry.toLowerCase()];
        }

        if (source.number_of_employees) {
            result.numberofemployees = source.number_of_employees;
        }

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

        if (source.phone_numbers[0]) {
            result.telephone1 = source.phone_numbers[0].phone_number;
        }
        if (source.phone_numbers[1]) {
            result.telephone2 = source.phone_numbers[1].phone_number;
        }
        if (source.phone_numbers[2]) {
            result.telephone3 = source.phone_numbers[2].phone_number;
        }




        // Cannot set read only property _createdby_value
        // if (source.user_id) {
        //   const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
        //   if (owner_id) {
        //     result._createdby_value = source.user_id;
        //   }
        // }

        // Microsoftdynamicssales company does not have attribute for email address
        // Microsoftdynamicssales Company doest not have direct mapping of number of employees

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
        source: MicrosoftdynamicssalesCompanyOutput | MicrosoftdynamicssalesCompanyOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmCompanyOutput | UnifiedCrmCompanyOutput[]> {
        if (!Array.isArray(source)) {
            return this.mapSingleCompanyToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }
        // Handling array of MicrosoftdynamicssalesCompanyOutput
        return Promise.all(
            source.map((company) =>
                this.mapSingleCompanyToUnified(
                    company,
                    connectionId,
                    customFieldMappings,
                ),
            ),
        );
    }

    private async mapSingleCompanyToUnified(
        company: MicrosoftdynamicssalesCompanyOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmCompanyOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = company[mapping.remote_id];
            }
        }

        let opts: any = {
            addresses: [],
            email_addresses: [],
            phone_numbers: []
        };

        const industryJSON = {
            1: "Accounting",
            2: "Agriculture and Non-petrol Natural Resource Extraction",
            3: "Broadcasting Printing and Publishing",
            4: "Brokers",
            5: "Building Supply Retail",
            6: "Business Services",
            7: "Consulting",
            8: "Consumer Services",
            9: "Design, Direction and Creative Management",
            10: "Distributors, Dispatchers and Processors",
            11: "Doctor's Offices and Clinics",
            12: "Durable Manufacturing",
            13: "Eating and Drinking Places",
            14: "Entertainment Retail",
            15: "Equipment Rental and Leasing",
            16: "Financial",
            17: "Food and Tobacco Processing",
            18: "Inbound Capital Intensive Processing",
            19: "Inbound Repair and Services",
            20: "Insurance",
            21: "Legal Services",
            22: "Non-Durable Merchandise Retail",
            23: "Outbound Consumer Service",
            24: "Petrochemical Extraction and Distribution",
            25: "Service Retail",
            26: "SIG Affiliations",
            27: "Social Services",
            28: "Special Outbound Trade Contractors",
            29: "Specialty Realty",
            30: "Transportation",
            31: "Utility Creation and Distribution",
            32: "Vehicle Retail",
            33: "Wholesale"
        }

        let address: any = {};

        if (company.address1_line1) {
            address = {
                street_1: company.address1_line1 ?? '',
                city: company.address1_city ?? '',
                state: company.address1_stateorprovince ?? '',
                postal_code: company.address2_postalcode ?? '',
                country: company.address1_country ?? '',
                address_type: 'WORK',
                owner_type: 'COMPANY',
            }
            opts.addresses.push(address);
        }
        if (company.address2_line1) {
            address = {
                street_1: company.address2_line1 ?? '',
                city: company.address2_city ?? '',
                state: company.address2_stateorprovince ?? '',
                postal_code: company.address2_postalcode ?? '',
                country: company.address2_country ?? '',
                address_type: 'WORK',
                owner_type: 'COMPANY',
            }
            opts.addresses.push(address);
        }


        if (company.emailaddress1) {
            opts.email_addresses.push({
                email_address: company.emailaddress1,
                email_address_type: "WORK"
            })
        }
        if (company.emailaddress2) {
            opts.email_addresses.push({
                email_address: company.emailaddress2,
                email_address_type: "WORK"
            })
        }
        if (company.emailaddress2) {
            opts.email_addresses.push({
                email_address: company.emailaddress3,
                email_address_type: "WORK"
            })
        }
        if (company.telephone1) {
            opts.phone_numbers.push({
                phone_number: company.telephone1,
                phone_type: "MOBILE"
            });
        }
        if (company.telephone2) {
            opts.phone_numbers.push({
                phone_number: company.telephone2,
                phone_type: "MOBILE"
            });
        }
        if (company.telephone3) {
            opts.phone_numbers.push({
                phone_number: company.telephone3,
                phone_type: "MOBILE"
            });
        }



        if (company._createdby_value) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                company._createdby_value,
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
            remote_id: company.accountid,
            remote_data: company,
            name: company.name,
            industry:
                company.industrycode ? industryJSON[company.industrycode] : null,
            number_of_employees: company.numberofemployees ?? null,
            field_mappings,
            ...opts,
        };
    }
}
