import { SetMetadata } from '@nestjs/common';

export const META_PERMITIONS = 'permissions';

export enum ValidPermitions {
  ADD_CHURCH = 'add:church',
  EDIT_CHURCH = 'edit:church',
  DELETE_CHURCH = 'delete:church',
  LIST_CHURCH = 'list:church',
  VIEW_CHURCH = 'view:church',
  ADD_USER = 'add:user',
  EDIT_USER = 'edit:user',
  DELETE_USER = 'delete:user',
  VIEW_USER = 'view:user',
  ADD_ROLE = 'add:role',
  EDIT_ROLE = 'edit:role',
  DELETE_ROLE = 'delete:role',
  VIEW_ROLE = 'view:role',
  ADD_PERMISSION = 'add:permission',
  EDIT_PERMISSION = 'edit:permission',
  DELETE_PERMISSION = 'delete:permission',
  VIEW_PERMISSION = 'view:permission',
}

export const PermitProtected = (...permitions: ValidPermitions[]) =>
  SetMetadata(META_PERMITIONS, permitions);
