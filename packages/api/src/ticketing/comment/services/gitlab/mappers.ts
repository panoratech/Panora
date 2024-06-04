import { ICommentMapper } from '@ticketing/comment/types';
import {
    UnifiedCommentInput,
    UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { GitlabCommentInput, GitlabCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@lib/@types';
import { unify } from '@@core/utils/unification/unify';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';;

export class GitlabCommentMapper implements ICommentMapper {
    private readonly utils: Utils;

    constructor() {
        this.utils = new Utils();
    }

    async desunify(
        source: UnifiedCommentInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<GitlabCommentInput> {

        // project_id and issue_id will be extracted and used so We do not need to set user (author) field here

        // TODO - Add attachments attribute


        const result: GitlabCommentInput = {
            body: source.body,
            internal: source.is_private || false,

        };
        return result;
    }

    async unify(
        source: GitlabCommentOutput | GitlabCommentOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
        if (!Array.isArray(source)) {
            return await this.mapSingleCommentToUnified(source, customFieldMappings);
        }
        return Promise.all(
            source.map((comment) =>
                this.mapSingleCommentToUnified(comment, customFieldMappings),
            ),
        );
    }

    private async mapSingleCommentToUnified(
        comment: GitlabCommentOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCommentOutput> {
        let opts;

        // TODO - Unify attachment attribute
        if (comment.attachment && comment.attachment.length > 0) {
            const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
                sourceObject: comment.attachment,
                targetType: TicketingObject.attachment,
                providerName: 'gitlab',
                vertical: 'ticketing',
                customFieldMappings: [],
            })) as UnifiedAttachmentOutput[];

            opts = { ...opts, attachments: unifiedObject };
        }


        if (comment.author.id) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(comment.author.id),
                'gitlab',
            );
            if (user_id) {
                opts = { ...opts, user_id };
            }
        }

        //   if (user_id) {
        //     opts = { user_id: user_id, creator_type: 'user' };
        //   } else {
        //     const contact_id = await this.utils.getContactUuidFromRemoteId(
        //       String(comment.sender.id),
        //       'gorgias',
        //     );
        //     if (contact_id) {
        //       opts = { creator_type: 'CONTACT', contact_id: contact_id };
        //     }
        //   }
        // }
        if (comment.noteable_id) {
            const ticket_id = await this.utils.getTicketUuidFromRemoteId(
                String(comment.noteable_id),
                'gitlab'
            )
            if (ticket_id) {
                opts = { ...opts, ticket_id };

            }
        }

        const res: UnifiedCommentOutput = {
            remote_id: String(comment.id),
            body: comment.body ? comment.body : '',
            is_private: comment.internal,
            creator_type: 'USER',
            ...opts
        };

        return {
            remote_id: String(comment.id),
            ...res
        };

    }
}
