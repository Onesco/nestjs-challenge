import { Logger, NotFoundException } from '@nestjs/common';
import {
  ClientSession,
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneWithSession(
    filterQuery: FilterQuery<TDocument>,
    session: ClientSession,
  ) {
    return await this.model.findOne(filterQuery).session(session);
  }

  async saveWithSession(
    document: Omit<TDocument, '_id'>,
    session: ClientSession,
  ) {
    const newDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return await newDocument.save({ session });
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    skip?: number,
    limit?: number,
  ): Promise<TDocument[]> {
    return this.model
      .find(filterQuery)
      .skip(skip)
      .limit(limit)
      .lean<TDocument[]>(true);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}
