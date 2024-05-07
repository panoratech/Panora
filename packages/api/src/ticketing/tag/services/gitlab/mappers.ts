import { ITagMapper } from '@ticketing/tag/types';
import { GitlabTagInput, GitlabTagOutput } from './types';
import {
    UnifiedTagInput,
    UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';

export class GitlabTagMapper implements ITagMapper {
    desunify(
        source: UnifiedTagInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): GitlabTagInput {
        return;
    }

    unify(
        source: GitlabTagOutput | GitlabTagOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedTagOutput | UnifiedTagOutput[] {
        // If the source is not an array, convert it to an array for mapping
        const sourcesArray = Array.isArray(source) ? source : [source];

        return sourcesArray.map((tag) =>
            this.mapSingleTagToUnified(tag, customFieldMappings),
        );
    }

    private mapSingleTagToUnified(
        tag: GitlabTagOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedTagOutput {
        const unifiedTag: UnifiedTagOutput = {
            remote_id: tag.name,
            name: tag.name,
        };

        return unifiedTag;
    }
}
