export function getRefId(
  ref: string | number | { _id: string | number },
): string | number {
  return typeof ref === "object" && ref !== null && "_id" in ref
    ? ref._id
    : ref;
}

export const getItem = <T extends { _id: any }>(
  _id: any,
  items: T[],
): T | undefined => {
  return items?.find((item: T) => item?._id === _id);
};
