import { IsMongoId, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  recordId: string;

  @IsInt()
  @Min(1)
  qty: number;
}
