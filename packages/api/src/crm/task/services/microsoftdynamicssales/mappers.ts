import { MicrosoftdynamicssalesTaskInput, MicrosoftdynamicssalesTaskOutput } from './types';
import {
    UnifiedCrmTaskInput,
    UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { ITaskMapper } from '@crm/task/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MicrosoftdynamicssalesTaskMapper implements ITaskMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'task', 'microsoftdynamicssales', this);
    }

    async desunify(
        source: UnifiedCrmTaskInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesTaskInput> {
        const result: MicrosoftdynamicssalesTaskInput = {
            subject: source.subject,
            description: source.content
        };

        if (source.status) {
            result.statecode = source.status === "COMPLETED" ? 1 : 0;
        }

        if (source.due_date) {
            result.scheduledend = new Date(source.due_date).toUTCString();
        }

        if (source.finished_date) {
            result.actualend = new Date(source.finished_date).toUTCString();
        }

        // User have to provide either company_id or deal_id which will be associated with current task
        if (source.company_id) {
            const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            result["regardingobjectid_account@odata.bind"] = `/accounts(${id})`;
        }

        else if (source.deal_id) {
            const id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
            result["regardingobjectid_opportunity@odata.bind"] = `/opportunities(${id})`;
        }

        return result;
    }

    async unify(
        source: MicrosoftdynamicssalesTaskOutput | MicrosoftdynamicssalesTaskOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmTaskOutput | UnifiedCrmTaskOutput[]> {
        if (!Array.isArray(source)) {
            return await this.mapSingleTaskToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }

        return Promise.all(
            source.map((task) =>
                this.mapSingleTaskToUnified(task, connectionId, customFieldMappings),
            ),
        );
    }

    private async mapSingleTaskToUnified(
        task: MicrosoftdynamicssalesTaskOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmTaskOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = task[mapping.remote_id];
            }
        }

        let opts: any = {};

        if (task.statecode) {
            opts = {
                ...opts,
                status: task.statecode === 1 ? "COMPLETED" : "PENDING"
            }
        }

        if (task.scheduledend) {
            opts = {
                ...opts,
                due_date: new Date(task.scheduledend)
            }
        }

        if (task.actualend) {
            opts = {
                ...opts,
                finished_date: new Date(task.actualend)
            }
        }


        // Here the task either associated to deal or company
        if (task._regardingobjectid_value) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                task._regardingobjectid_value,
                connectionId,
            );

            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id,
                }
            }

            const deal_id = await this.utils.getDealUuidFromRemoteId(
                task._regardingobjectid_value,
                connectionId,
            )

            if (deal_id) {
                opts = {
                    ...opts,
                    deal_id: deal_id,
                }
            }
        }

        if (task._createdby_value) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                task._createdby_value,
                connectionId
            )

            opts = {
                ...opts,
                user_id: user_id
            }
        }

        return {
            remote_id: task.activityid,
            subject: task.subject ?? '',
            remote_data: task,
            content: task.description ?? '',
            field_mappings,
            ...opts,
        };
    }
}
