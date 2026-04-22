import type { Experiment } from "../../types";
import { Paths, useGetList, useMutationApi } from "./factory";

const baseUrl = Paths.Experiments;

export function useExperimentMutations() {
  const {
    createItem: createExperiment,
    updateItem: updateExperiment,
    deleteItem: deleteExperiment,
  } = useMutationApi<Experiment>({
    baseQuery: baseUrl,
    queryKey: [baseUrl],
  });

  return {
    createExperiment,
    updateExperiment,
    deleteExperiment,
  };
}

export function useGetExperiments() {
  return useGetList<Experiment>(baseUrl, [baseUrl]);
}
