import { Injectable } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { UnstructuredLoader } from '@langchain/community/document_loaders/fs/unstructured';
import { Readable } from 'stream';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { Document } from 'langchain/document';
import * as csvtojson from 'csvtojson';

type UnstructuredCredsType = {
  apiKey: string;
  apiUrl: string;
};
@Injectable()
export class DocumentLoaderService {
  private unstructuredCreds: UnstructuredCredsType;
  constructor(private envService: EnvironmentService) {
    this.unstructuredCreds = this.envService.getUnstructuredCreds();
  }
  async loadDocumentFromStream(
    stream: Readable,
    fileType: string,
    fileName?: string,
  ) {
    const buffer = await this.streamToBuffer(stream);
    const loaders = {
      pdf: (buf: Buffer) => new PDFLoader(new Blob([buf])),
      docx: (buf: Buffer) => new DocxLoader(new Blob([buf])),
      csv: (buf: Buffer) => ({
        load: async () => {
          const content = buf.toString('utf-8');
          const lines = content.split('\n');
          const separator = this.detectSeparator(lines[0]);
          const headers = lines[0]
            .split(separator)
            .map((header) => header.trim());

          const jsonData = await csvtojson({
            delimiter: separator,
            headers: headers,
            output: 'json',
          }).fromString(content);

          const formattedData = jsonData.map((item: any) => {
            const formattedItem: Record<string, any> = {};
            for (const key in item) {
              const value = item[key];
              formattedItem[key] = isNaN(Number(value)) ? value : Number(value);
            }
            return formattedItem;
          });

          // console.log('json data from csv is ' + JSON.stringify(formattedData));

          return formattedData.map(
            (item, index) =>
              new Document({
                pageContent: JSON.stringify(item),
                metadata: {
                  source: fileName || 'csv',
                  row: index + 2,
                  columns: headers,
                },
              }),
          );
        },
      }),
      txt: (buf: Buffer) => new TextLoader(new Blob([buf])),
      md: (buf: Buffer) =>
        new UnstructuredLoader(
          { buffer: buf, fileName: fileName },
          {
            apiKey: this.unstructuredCreds.apiKey,
            apiUrl: this.unstructuredCreds.apiUrl,
          },
        ),
    };

    const loaderFunction = loaders[fileType as keyof typeof loaders];
    if (!loaderFunction) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    const loader = loaderFunction(buffer);
    return loader.load();
  }

  private detectSeparator(headerLine: string): string {
    const possibleSeparators = [',', ';', '\t', '|'];
    return possibleSeparators.reduce((a, b) =>
      headerLine.split(a).length > headerLine.split(b).length ? a : b,
    );
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
