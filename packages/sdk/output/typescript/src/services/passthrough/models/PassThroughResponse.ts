export interface PassThroughResponse {
  url: string;
  status: number;
  data: Data;
}
interface Data {
  [k: string]: unknown;
}
