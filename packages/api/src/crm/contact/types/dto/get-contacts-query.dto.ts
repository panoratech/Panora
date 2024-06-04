import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator'

export class GetContactsQueryDto {

    @IsOptional()
    @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
    @IsBoolean()
    remote_data: boolean;

    @IsOptional()
    @IsNumber()
    @Transform(p => Number(p.value))
    pageSize: number;

    @IsOptional()
    @Transform(p => Buffer.from(p.value, 'base64').toString())
    @IsUUID()
    cursor: string;






}