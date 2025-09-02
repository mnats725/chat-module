export const unwrapArrayResponse = <T>(data: T[] | null | undefined, context = 'API response'): T => {
  if (!data || data.length === 0) {
    throw new Error(`${context}: empty array`);
  }
  return data[0];
};
