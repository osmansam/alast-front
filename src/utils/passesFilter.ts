export const passesFilter = (
  filterValue: string | number | boolean | null | undefined,
  itemValue: string | number | boolean | null | undefined,
) => {
  return filterValue === "" || itemValue === filterValue;
};
