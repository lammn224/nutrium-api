// COMMON
export const DATA_REFERENCE = 'DATA_REFERENCE';

// USER
export const BLACKLIST_TOKEN = 'BLACKLIST_TOKEN';
export const USER_NOT_EXIST = 'USER_NOT_EXIST';
export const WRONG_USER_OR_PASSWORD = 'WRONG_USER_OR_PASSWORD';
export const INACTIVE = 'INACTIVE';
export const BLOCKED = 'BLOCKED';
export const DELETED = 'DELETED';
export const USER_NOT_EXIST_OR_DELETED = 'USER_NOT_EXIST_OR_DELETED';
export const WRONG_CURRENT_PASSWORD = 'WRONG_CURRENT_PASSWORD';
export const USER_ALREADY_ACTIVE = 'USER_ALREADY_ACTIVE';
export const USER_ALREADY_BLOCKED = 'USER_ALREADY_BLOCKED';
export const USERNAME_ALREADY_EXIST = 'USERNAME_ALREADY_EXIST';

//FOOD
export const FOOD_NOT_EXIST = 'FOOD_NOT_EXIST';

export const ERROR_CODES = new Map<string, string>([
  [DATA_REFERENCE, 'Data reference'],

  [BLACKLIST_TOKEN, 'Token is in blacklist (logout, deleted, ...)'],

  [USER_NOT_EXIST, 'User is not exist'],
  [WRONG_USER_OR_PASSWORD, 'User or password login are wrong.'],
  [INACTIVE, 'User account is not active.'],
  [BLOCKED, 'User account is blocked.'],
  [DELETED, 'User account is deleted.'],
  [USER_NOT_EXIST_OR_DELETED, 'User is not exist or deleted.'],
  [WRONG_CURRENT_PASSWORD, 'Wrong current password.'],
  [USER_ALREADY_ACTIVE, 'User already active.'],
  [USER_ALREADY_BLOCKED, 'User already blocked.'],
  [USERNAME_ALREADY_EXIST, 'Username already exist.'],

  [FOOD_NOT_EXIST, 'Food is not exist'],
]);
