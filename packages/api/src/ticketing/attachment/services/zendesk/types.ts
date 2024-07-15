export type ZendeskAttachmentOutput = {
  content_type: string; // The content type of the image, e.g., "image/png".
  content_url: string; // A full URL where the attachment image file can be downloaded.
  deleted: boolean; // If true, the attachment has been deleted.
  file_name: string; // The name of the image file.
  height: string | null; // The height of the image file in pixels, or null if unknown.
  id: number; // Automatically assigned when created.
  inline: boolean; // If true, the attachment is excluded from the attachment list.
  malware_access_override: boolean; // If true, you can download an attachment flagged as malware.
  malware_scan_result:
    | 'malware_found'
    | 'malware_not_found'
    | 'failed_to_scan'
    | 'not_scanned'; // The result of the malware scan.
  mapped_content_url: string; // The URL the attachment image file has been mapped to.
  size: number; // The size of the image file in bytes.
  thumbnails: ZendeskAttachmentOutput[]; // An array of attachment objects.
  url: string; // A URL to access the attachment details.
  width: string | null; // The width of the image file in pixels, or null if unknown.
} & {
  [key: string]: any;
};
