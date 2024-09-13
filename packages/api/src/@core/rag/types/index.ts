export interface FileInfo {
  id: string;
  url: string;
  s3Key: string;
  provider: string;
  fileType: string;
}
export interface ProcessedChunk {
  text: string;
  metadata: Record<string, any>;
}
