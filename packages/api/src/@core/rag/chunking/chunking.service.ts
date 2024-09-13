import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';

@Injectable()
export class DocumentSplitterService {
  async chunkDocument(
    documents: Document[],
    fileType: string,
    chunkSize = 1000,
    chunkOverlap = 200,
  ): Promise<Document[]> {
    const chunkedDocuments: Document[] = [];

    for (const document of documents) {
      let chunks: Document[];

      if (fileType === 'json' || fileType === 'csv') {
        chunks = await this.chunkJSON(document, chunkSize);
      } else {
        chunks = await this.chunkText(document, chunkSize, chunkOverlap);
      }

      chunkedDocuments.push(...chunks);
    }

    return chunkedDocuments;
  }

  private async chunkText(
    document: Document,
    chunkSize: number,
    chunkOverlap: number,
  ): Promise<Document[]> {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    return textSplitter.splitDocuments([document]);
  }

  private async chunkJSON(
    document: Document,
    chunkSize: number,
  ): Promise<Document[]> {
    const jsonContent = JSON.parse(document.pageContent);
    const chunks: Document[] = [];
    let currentChunk: Record<string, any> = {};
    let currentSize = 0;

    for (const [key, value] of Object.entries(jsonContent)) {
      const entrySize = JSON.stringify({ [key]: value }).length;

      if (currentSize + entrySize > chunkSize && currentSize > 0) {
        chunks.push(
          new Document({
            pageContent: JSON.stringify(currentChunk),
            metadata: { ...document.metadata, chunk: chunks.length + 1 },
          }),
        );
        currentChunk = {};
        currentSize = 0;
      }

      currentChunk[key] = value;
      currentSize += entrySize;
    }

    if (Object.keys(currentChunk).length > 0) {
      chunks.push(
        new Document({
          pageContent: JSON.stringify(currentChunk),
          metadata: { ...document.metadata, chunk: chunks.length + 1 },
        }),
      );
    }

    return chunks;
  }
}