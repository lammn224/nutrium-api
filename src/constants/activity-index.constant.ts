export const NONE = 'none';
export const LIGHT = 'light';
export const MODERATE = 'moderate';
export const HEAVY = 'heavy';

export const activityIdx = new Map<string, number>([
  [NONE, 1.2],
  [LIGHT, 1.375],
  [MODERATE, 1.55],
  [HEAVY, 1.725],
]);
