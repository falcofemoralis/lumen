export const calculateRows = <T, >(list: T[], numberOfColumns: number) => {
  const columns: T[][] = Array.from({ length: numberOfColumns }, () => []);

  list.forEach((item, index) => {
    columns[index % numberOfColumns].push(item);
  });

  const rows: T[][] = [];

  for (let i = 0; i < columns[0].length; i++) {
    const row: T[] = [];

    for (let j = 0; j < numberOfColumns; j++) {
      if (columns[j][i] !== undefined) {
        row.push(columns[j][i]);
      }
    }
    rows.push(row);
  }

  return rows;
};
