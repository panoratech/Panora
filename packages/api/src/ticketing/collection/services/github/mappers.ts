import { ICollectionMapper } from '@ticketing/collection/types';
import { GithubCollectionInput, GithubCollectionOutput } from './types';
import {
    UnifiedCollectionInput,
    UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GithubCollectionMapper implements ICollectionMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService(
            'ticketing',
            'collection',
            'github',
            this,
        );
    }
    desunify(
        source: UnifiedCollectionInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): GithubCollectionInput {
        return;
    }

    unify(
        source: GithubCollectionOutput | GithubCollectionOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedCollectionOutput | UnifiedCollectionOutput[] {
        // If the source is not an array, convert it to an array for mapping
        const sourcesArray = Array.isArray(source) ? source : [source];

        return sourcesArray.map((collection) =>
            this.mapSingleCollectionToUnified(
                collection,
                connectionId,
                customFieldMappings,
            ),
        );
    }

    private mapSingleCollectionToUnified(
        collection: GithubCollectionOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedCollectionOutput {
        const unifiedCollection: UnifiedCollectionOutput = {
            remote_id: String(collection.id),
            remote_data: collection,
            name: collection.name,
            description: collection.description,
            collection_type: 'PROJECT',
        };

        return unifiedCollection;
    }
}
