export const NONE = 'NONE';
export const LIGHT = 'LIGHT';
export const MODERATE = 'MODERATE';
export const HEAVY = 'HEAVY';

export const activityIdx = new Map<string, number>([
  [NONE, 1.2],
  [LIGHT, 1.375],
  [MODERATE, 1.55],
  [HEAVY, 1.725],
]);
