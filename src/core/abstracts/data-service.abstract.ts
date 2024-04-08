import { IGenericRepository } from './generic-repository.abstract';
import { User } from '../entities';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
}
