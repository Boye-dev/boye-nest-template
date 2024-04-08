import { HydratedDocument, Types } from 'mongoose';

export abstract class IGenericRepository<T> {
  abstract findAll(param?: any, populate?: any);

  abstract find(param?: any);

  abstract findById(id: Types.ObjectId): Promise<HydratedDocument<T>>;

  abstract findOne(param: any): Promise<HydratedDocument<T>>;

  abstract create(item: Partial<T>): Promise<HydratedDocument<T>>;

  abstract update(
    id: Types.ObjectId,
    item: Partial<T>,
  ): Promise<HydratedDocument<T>>;

  abstract delete(id: Types.ObjectId);

  abstract insertMany(item: T[]);

  abstract updateMany(filter: any, item: Partial<T>);

  abstract findAggregate(aggregrate: any, page: number, pageSize: number);
}
