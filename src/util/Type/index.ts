export const convertBooleanToString = (value: boolean): string => {
  return value ? 'true' : 'false';
};

export const convertStringToBoolean = (value: string | null): any => {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  return value;
};

export const convertStringToNumber = (value: string | null): any => {
  if (value && !isNaN(Number(value))) {
    return Number(value);
  }

  return value;
};