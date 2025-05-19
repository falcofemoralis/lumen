/** Used to generate unique IDs. */
let idCounter = 0;

export const generateId = () => (Math.random() + 1).toString(36).substring(7);

export const uniqueId = (prefix = '') => {
  idCounter += 1;

  return `${prefix}${idCounter}`;
}
