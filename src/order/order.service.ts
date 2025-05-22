// order.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Connection } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { RecordRepository } from 'src/record/record.repository';
import { OrderRepository } from './order.repository';
import { OrderStatus } from './types/order.types';

@Injectable()
export class OrderService {
  constructor(
    private readonly recordRepository: RecordRepository,
    private readonly orderRepository: OrderRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const record = await this.recordRepository.findOneWithSession(
        { _id: dto.recordId },
        session,
      );

      if (!record) {
        throw new NotFoundException('Record not found');
      }

      if (record.qty < dto.qty) {
        throw new BadRequestException('Insufficient stock');
      }

      // Deduct stock
      record.qty -= dto.qty;
      record.lastModified = new Date();
      await record.save({ session });

      // Create order
      const order = await this.orderRepository.saveWithSession(
        {
          recordId: record._id,
          qty: dto.qty,
          status: OrderStatus.PENDING,
          created: new Date(),
        },
        session,
      );

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
