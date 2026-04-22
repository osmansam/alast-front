import type { School } from "../../types";
import { Paths, useGetList, useMutationApi } from "./factory";

const baseUrl = Paths.Schools;

export function useSchoolMutations() {
  const {
    createItem: createSchool,
    updateItem: updateSchool,
    deleteItem: deleteSchool,
  } = useMutationApi<School>({
    baseQuery: baseUrl,
    queryKey: [baseUrl],
  });

  return {
    createSchool,
    updateSchool,
    deleteSchool,
  };
}

export function useGetSchools() {
  return useGetList<School>(baseUrl, [baseUrl]);
}
