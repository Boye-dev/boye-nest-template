import { FilterQuery, HydratedDocument, Model } from 'mongoose';
import { IGenericRepository } from '../../../core';
import { QueryDto } from 'src/core/dto/query.dto';
import { Types } from 'mongoose';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
  private _repository: Model<T>;

  constructor(repository: Model<T>) {
    this._repository = repository;
  }

  async findAll(param?: QueryDto, populate?: any) {
    const page = param?.page - 1 || 0;
    const pageSize = param?.pageSize || 10;

    const search = param?.search || '';
    const searchBy = param?.searchBy || [];
    const searchObject = [];

    for (const option of searchBy) {
      const optionObj = {};
      optionObj[option] = { $regex: search, $options: 'i' };
      searchObject.push(optionObj);
    }

    const findOperation = param?.findOperation;

    const sortBy = param?.sortBy || null;

    let match: FilterQuery<T>;
    if (searchObject.length > 0) {
      match = { $and: [{ $or: searchObject }, { ...findOperation }] };
    } else {
      match = { ...findOperation };
    }

    const total = await this._repository.countDocuments(match);
    if (populate) {
      const data = await this._repository
        .find(match)
        .sort({
          [sortBy]:
            param?.sortOrder === 'asc'
              ? 1
              : param?.sortOrder === 'desc'
                ? -1
                : 1,
        })
        .skip(page * pageSize)
        .limit(pageSize)
        .populate(populate);
      return { total, page, pageSize, data };
    }
    const data = await this._repository
      .find(match)
      .sort({
        [sortBy]:
          param?.sortOrder === 'asc' ? 1 : param?.sortOrder === 'desc' ? -1 : 1,
      })
      .skip(page * pageSize)
      .limit(pageSize);
    return { total, page, pageSize, data };
  }

  findById(id: Types.ObjectId): Promise<HydratedDocument<T>> {
    return this._repository.findById(id);
  }

  findOne(param: any): Promise<HydratedDocument<T>> {
    return this._repository.findOne(param);
  }

  find(param: any) {
    return this._repository.find(param);
  }

  create(item: T): Promise<HydratedDocument<T>> {
    return this._repository.create(item);
  }

  insertMany(item: T[]) {
    return this._repository.insertMany(item);
  }

  updateMany(filter: any, item: Partial<T>) {
    return this._repository.updateMany(filter, item);
  }

  update(id: Types.ObjectId, item: T): Promise<HydratedDocument<T>> {
    return this._repository.findByIdAndUpdate(id, item, {
      new: true,
    });
  }
  delete(id: Types.ObjectId) {
    return this._repository.findByIdAndDelete(id);
  }

  async findAggregate(aggregrate: any, page: number, pageSize: number) {
    const data = await this._repository.aggregate(aggregrate).exec();
    const total = data[0].total[0] ? data[0].total[0].total : 0;
    return { total, page, pageSize, data: data[0].documents };
  }
}
