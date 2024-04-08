import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../interfaces/user.interfaces';

export const HasRoles = (...roles: RolesEnum[]) => SetMetadata('roles', roles);
