// order.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Record, RecordSchema } from '../record/schemas/record.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { RecordRepository } from 'src/record/record.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Record.name, schema: RecordSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, RecordRepository],
})
export class OrderModule {}
