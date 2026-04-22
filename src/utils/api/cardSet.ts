import type { CardSet } from "../../types";
import { Paths, useGetList, useMutationApi } from "./factory";

const baseUrl = Paths.CardSets;

export function useCardSetMutations() {
  const {
    createItem: createCardSet,
    updateItem: updateCardSet,
    deleteItem: deleteCardSet,
  } = useMutationApi<CardSet>({
    baseQuery: baseUrl,
    queryKey: [baseUrl],
  });

  return {
    createCardSet,
    updateCardSet,
    deleteCardSet,
  };
}

export function useGetCardSets() {
  return useGetList<CardSet>(baseUrl, [baseUrl]);
}
