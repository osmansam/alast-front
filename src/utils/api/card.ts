import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { post } from ".";
import type { Card } from "../../types";
import { getApiErrorMessage } from "../getApiErrorMessage";
import { Paths, useGetList, useMutationApi } from "./factory";

const baseUrl = Paths.Cards;

type GenerateCardsPayload = {
  topic: string;
  counts: Record<string, number>;
  lang: string;
};

type TranslateCardSetPayload = {
  lang: string;
};

export function useCardMutations() {
  const {
    createItem: createCard,
    updateItem: updateCard,
    deleteItem: deleteCard,
  } = useMutationApi<Card>({
    baseQuery: baseUrl,
    queryKey: [baseUrl],
  });

  return {
    createCard,
    updateCard,
    deleteCard,
  };
}

export function useGetCards() {
  return useGetList<Card>(baseUrl, [baseUrl]);
}

export function useGenerateCardSetCards(cardSetId?: number | string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload: GenerateCardsPayload) => {
      if (cardSetId === undefined || cardSetId === null) {
        throw new Error("Card set id is required");
      }

      return post<GenerateCardsPayload, unknown>({
        path: `${Paths.CardSets}/${cardSetId}/generate`,
        payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [baseUrl] });
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to generate cards",
      );
      setTimeout(() => toast.error(t(errorMessage)), 200);
    },
  });
}

export function useTranslateCardSet(cardSetId?: number | string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (payload: TranslateCardSetPayload) => {
      if (cardSetId === undefined || cardSetId === null) {
        throw new Error("Card set id is required");
      }

      return post<TranslateCardSetPayload, unknown>({
        path: `${baseUrl}/translate/${cardSetId}`,
        payload,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [baseUrl] });
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to translate card set",
      );
      setTimeout(() => toast.error(t(errorMessage)), 200);
    },
  });
}
