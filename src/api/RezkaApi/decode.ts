export const decrypt = (encrypted: string): string => {
  if (!encrypted.startsWith('#')) return encrypted;

  const TRASH_SEPARATOR = '//_//';
  const TRASH_SYMBOLS = ['@', '#', '!', '^', '$'];
  const CLEAR_BEFORE_SYMBOLS = ['/', '='];

  const trashRegExp = generateTrashRegExp(TRASH_SYMBOLS);
  const cache = new Map<string, string>();

  const decryptRecursive = (input: string): string => {
    if (cache.has(input)) return cache.get(input)!;

    const indexes = indexesOf(input, TRASH_SEPARATOR);

    if (indexes.length === 0) {
      cache.set(input, input);

      return input;
    }

    const decrypted = indexes
      .map((index) => {
        const [before, after] = divideAtFirstOccurrenceOfSymbols(
          input.slice(index + TRASH_SEPARATOR.length),
          CLEAR_BEFORE_SYMBOLS
        );

        return decryptRecursive(
          input.slice(0, index) +
                        before.replace(trashRegExp, '') +
                        after
        );
      })
      .reduce(
        (shortest, current) =>
          current.length < shortest.length ? current : shortest,
        input
      );

    cache.set(input, decrypted);

    return decrypted;
  };

  return atob(decryptRecursive(encrypted.slice(2)));
};

const generateTrashRegExp = (symbols: string[]): RegExp =>
  new RegExp(
    [2, 3]
      .flatMap((n) => cartesianProduct(symbols, n))
      .map((trash) => btoa(trash))
      .join('|'),
    'g'
  );

const cartesianProduct = (symbols: string[], n: number): string[] =>
  n > 1
    ? cartesianProduct(symbols, n - 1).flatMap((firstSymbol) =>
      symbols.map((secondSymbol) => firstSymbol + secondSymbol))
    : symbols;

const indexesOf = (input: string, search: string): number[] => {
  const indexes: number[] = [];
  let index = 0;
  while ((index = input.indexOf(search, index)) != -1) {
    indexes.push(index++);
  }

  return indexes;
};

const divideAtFirstOccurrenceOfSymbols = (
  input: string,
  symbols: string[]
): [string, string] => {
  const index = [...input].findIndex((symbol) => symbols.includes(symbol));

  return index !== -1
    ? [input.slice(0, index + 1), input.slice(index + 1)]
    : [input, ''];
};