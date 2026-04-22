import type { Class } from "../../types";
import { Paths, useGetList, useMutationApi } from "./factory";

const baseUrl = Paths.Classes;

export function useClassMutations() {
  const {
    createItem: createClass,
    updateItem: updateClass,
    deleteItem: deleteClass,
  } = useMutationApi<Class>({
    baseQuery: baseUrl,
    queryKey: [baseUrl],
  });

  return {
    createClass,
    updateClass,
    deleteClass,
  };
}

export function useGetClasses() {
  return useGetList<Class>(baseUrl, [baseUrl]);
}
