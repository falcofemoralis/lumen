export const convertBooleanToString = (value: boolean): string => {
  return value ? 'true' : 'false';
};

export const convertStringToBoolean = (value: string | null): boolean | string | null => {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  return value;
};