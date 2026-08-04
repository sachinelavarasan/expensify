// Shared by every horizontally-scrolling picker grid (CategoryPickerSheet,
// IconPickerSheet, ColorPickerSheet). Those grids use a flexWrap
// column-direction container so they can scroll sideways with a fixed row
// count, but that fills each column top-to-bottom before starting the next
// one - so feeding it items in plain list order reads "down, then across"
// instead of left-to-right. This pre-arranges a list into the column-major
// sequence a row-major reading order would produce, so the column-fill
// mechanism ends up rendering left-to-right, top-to-bottom like a normal grid.
export function toColumnMajorOrder<T>(items: T[], rows: number): T[] {
  const columns = Math.ceil(items.length / rows);
  const result: T[] = [];
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      const index = row * columns + column;
      if (index < items.length) {
        result.push(items[index]);
      }
    }
  }
  return result;
}
