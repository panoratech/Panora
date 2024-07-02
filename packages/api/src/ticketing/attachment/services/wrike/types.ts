export type WrikeAttachmentOutput = {
    id: string;
    filename: string;
    url: string;
    content_type: string;
    size: number;
    metadata: AttachmentMetadata;
};

type AttachmentMetadata = {
    is_inline: boolean;
    cid: string;
};
