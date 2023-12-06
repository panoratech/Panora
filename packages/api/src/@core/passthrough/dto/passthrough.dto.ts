export class PassThroughRequestDto {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  data?: Record<string, any> | Record<string, any>[];
  headers?: Record<string, string>;
}
