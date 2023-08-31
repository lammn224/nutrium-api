// COMMON
export const DATA_REFERENCE = 'DATA_REFERENCE';

// USER
export const BLACKLIST_TOKEN = 'BLACKLIST_TOKEN';
export const WRONG_USER_OR_PASSWORD = 'WRONG_USER_OR_PASSWORD';
export const INACTIVE = 'INACTIVE';
export const BLOCKED = 'BLOCKED';
export const DELETED = 'DELETED';
export const USER_NOT_EXIST_OR_DELETED = 'USER_NOT_EXIST_OR_DELETED';
export const USER_NOT_EXIST = 'USER_NOT_EXIST';
export const PHONE_NUMBER_ALREADY_EXIST = 'PHONE_NUMBER_ALREADY_EXIST';
export const PARENTS_ACCOUNT_NOT_FOUND = 'PARENTS_ACCOUNT_NOT_FOUND';
export const PARENTS_ACCOUNT_EXISTED = 'PARENTS_ACCOUNT_EXISTED';
export const STUDENT_ID_ALREADY_EXISTED = 'STUDENT_ID_ALREADY_EXISTED';
export const CONTACT_SYSADMIN_TO_ACTIVE = 'CONTACT_SYSADMIN_TO_ACTIVE';
export const PLEASE_CONFIRM = 'PLEASE_CONFIRM';

// SCHOOL
export const SCHOOL_NOT_EXIST = 'SCHOOL_NOT_EXIST';
export const SCHOOL_CODE_EXISTED = 'SCHOOL_CODE_EXISTED';
export const GRADE_EXISTED = 'GRADE_EXISTED';
export const GRADE_NOT_EXISTED = 'GRADE_NOT_EXISTED';

//ACTIVITY
export const ACTIVITY_EXISTED = 'ACTIVITY_EXISTED';
export const ACTIVITY_NOT_EXISTED = 'ACTIVITY_NOT_EXISTED';
export const ACTIVITY_CANNOT_UPDATED = 'ACTIVITY_CANNOT_UPDATED';
export const ACTIVITY_CANNOT_DELETED = 'ACTIVITY_CANNOT_DELETED';

//FOOD
export const FOOD_NOT_EXIST = 'FOOD_NOT_EXIST';
export const FOOD_CANNOT_UPDATED = 'FOOD_CANNOT_UPDATED';
export const FOOD_CANNOT_DELETED = 'FOOD_CANNOT_DELETED';

// FILE
export const UPLOAD_FAILED = 'UPLOAD_FAILED';

// MEAL
export const MEAL_EXISTED = 'MEAL_EXISTED';
export const MEAL_NOT_EXISTED = 'MEAL_NOT_EXISTED';
export const MEAL_NOT_UPDATED = 'MEAL_NOT_UPDATED';
export const MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES =
  'MEAL_HAS_OVERCOME_MAX_BREAKFAST_CALORIES';
export const MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES =
  'MEAL_HAS_OVERCOME_MAX_DINNER_CALORIES';

// MEAL_COMPILATION
export const MEAL_COMPILATION_NOT_EXISTED = 'MEAL_COMPILATION_NOT_EXISTED';

// SCHEDULE EXERCISE
export const SCHEDULE_EXISTED = 'SCHEDULE_EXISTED';
export const SCHEDULE_NOT_EXISTED = 'SCHEDULE_NOT_EXISTED';

export const ERROR_CODES = new Map<string, string>([
  [DATA_REFERENCE, 'Data reference'],
  [BLACKLIST_TOKEN, 'Token is in blacklist (logout, deleted, ...)'],
  [WRONG_USER_OR_PASSWORD, 'User or password login are wrong.'],
  [INACTIVE, 'User account is not active.'],
  [BLOCKED, 'User account is blocked.'],
  [DELETED, 'User account is deleted.'],

  // USER
  [USER_NOT_EXIST_OR_DELETED, 'User is not exist or deleted.'],
  [USER_NOT_EXIST, 'User is not exist'],
  [PHONE_NUMBER_ALREADY_EXIST, 'Phone number is already existed'],
  [PARENTS_ACCOUNT_NOT_FOUND, 'Parents account is not found'],
  [PARENTS_ACCOUNT_EXISTED, 'Parents account is already existed'],
  [STUDENT_ID_ALREADY_EXISTED, 'Student ID is already existed'],
  [CONTACT_SYSADMIN_TO_ACTIVE, 'Please contact sysadmin to access system'],
  [PLEASE_CONFIRM, 'Please confirm by active code sent'],

  // SCHOOL
  [SCHOOL_NOT_EXIST, 'School is not exist'],
  [SCHOOL_CODE_EXISTED, 'School code is already existed'],
  [GRADE_EXISTED, 'Grade is already existed'],
  [GRADE_NOT_EXISTED, 'Grade is not existed'],

  // FOOD
  [FOOD_NOT_EXIST, 'Food is not exist'],
  [FOOD_CANNOT_UPDATED, 'Food cannot be updated'],
  [FOOD_CANNOT_DELETED, 'Food cannot be deleted'],

  // FILE
  [UPLOAD_FAILED, 'Upload fail, please check data again'],

  //MEAL
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

  // MEAL_COMPILATION
  [MEAL_COMPILATION_NOT_EXISTED, 'Meal compilation is not existed'],

  // ACTIVITY
  [ACTIVITY_EXISTED, 'Activity is already existed'],
  [ACTIVITY_NOT_EXISTED, 'Activity is not existed'],
  [ACTIVITY_CANNOT_UPDATED, 'Activity cannot be updated'],
  [ACTIVITY_CANNOT_DELETED, 'Activity cannot be deleted'],

  // SCHEDULE EXERCISE
  [SCHEDULE_EXISTED, 'Schedule exercise is already existed'],
  [SCHEDULE_NOT_EXISTED, 'Schedule exercise is not exist'],
]);
