// COMMON
export const DATA_REFERENCE = 'DATA_REFERENCE';

// USER
export const BLACKLIST_TOKEN = 'BLACKLIST_TOKEN';
export const USER_NOT_EXIST = 'USER_NOT_EXIST';
export const PARENTS_ACCOUNT_NOT_FOUND = 'PARENTS_ACCOUNT_NOT_FOUND';
export const PARENTS_ACCOUNT_EXISTED = 'PARENTS_ACCOUNT_EXISTED';
export const STUDENT_ID_ALREADY_EXISTED = 'STUDENT_ID_ALREADY_EXISTED';
export const WRONG_USER_OR_PASSWORD = 'WRONG_USER_OR_PASSWORD';
export const INACTIVE = 'INACTIVE';
export const BLOCKED = 'BLOCKED';
export const DELETED = 'DELETED';
export const USER_NOT_EXIST_OR_DELETED = 'USER_NOT_EXIST_OR_DELETED';
export const WRONG_CURRENT_PASSWORD = 'WRONG_CURRENT_PASSWORD';
export const USER_ALREADY_ACTIVE = 'USER_ALREADY_ACTIVE';
export const USER_ALREADY_BLOCKED = 'USER_ALREADY_BLOCKED';
export const USERNAME_ALREADY_EXIST = 'USERNAME_ALREADY_EXIST';

export const SCHOOL_NOT_EXIST = 'SCHOOL_NOT_EXIST';

export const GRADE_EXISTED = 'GRADE_EXISTED';
export const GRADE_NOT_EXISTED = 'GRADE_NOT_EXISTED';

//FOOD
export const FOOD_NOT_EXIST = 'FOOD_NOT_EXIST';

export const UPLOAD_FAILED = 'UPLOAD_FAILED';

export const MEAL_EXISTED = 'MEAL_EXISTED';
export const MEAL_NOT_EXISTED = 'MEAL_NOT_EXISTED';
export const MEAL_NOT_UPDATED = 'MEAL_NOT_UPDATED';
export const MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES =
  'MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES';
export const MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES =
  'MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES';

export const SCHOOL_CODE_EXISTED = 'SCHOOL_CODE_EXISTED';

export const ERROR_CODES = new Map<string, string>([
  [DATA_REFERENCE, 'Data reference'],

  [BLACKLIST_TOKEN, 'Token is in blacklist (logout, deleted, ...)'],

  [USER_NOT_EXIST, 'User is not exist'],
  [STUDENT_ID_ALREADY_EXISTED, 'Student ID is already existed'],
  [WRONG_USER_OR_PASSWORD, 'User or password login are wrong.'],
  [INACTIVE, 'User account is not active.'],
  [BLOCKED, 'User account is blocked.'],
  [DELETED, 'User account is deleted.'],
  [USER_NOT_EXIST_OR_DELETED, 'User is not exist or deleted.'],
  [WRONG_CURRENT_PASSWORD, 'Wrong current password.'],
  [USER_ALREADY_ACTIVE, 'User already active.'],
  [USER_ALREADY_BLOCKED, 'User already blocked.'],
  [USERNAME_ALREADY_EXIST, 'Username already exist.'],

  [SCHOOL_NOT_EXIST, 'School is not exist'],

  [FOOD_NOT_EXIST, 'Food is not exist'],

  [UPLOAD_FAILED, 'Upload fail, please check data again'],

  [MEAL_EXISTED, 'Meal is already existed in day'],
  [MEAL_NOT_EXISTED, 'Meal is not existed'],
  [MEAL_NOT_UPDATED, 'Cannot update this meal'],
  [
    MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES,
    'Meal has overcome breakfast calories limit',
  ],
  [
    MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES,
    'Meal has overcome dinner calories limit',
  ],
  [GRADE_EXISTED, 'Grade is already existed'],
  [GRADE_NOT_EXISTED, 'Grade is not existed'],

  [PARENTS_ACCOUNT_NOT_FOUND, 'Parents account is not found'],
  [PARENTS_ACCOUNT_EXISTED, 'Parents account is already existed'],
  [SCHOOL_CODE_EXISTED, 'School code is already existed'],
]);
