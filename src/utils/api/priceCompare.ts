import { Paths, useGet } from "./factory";

export type PriceCompareSites = Record<string, string>;

export interface PriceCompareItem {
  name: string;
  prices: Record<string, number>;
}

export interface PriceCompareHashmapResponse {
  sites: PriceCompareSites;
  totalItems: number;
  totalKeys: number;
  hashmap: Record<string, PriceCompareItem>;
}

const priceCompareBaseUrl = Paths.PriceCompare;

export function useGetGlobalPriceCompareHashmap() {
  return useGet<PriceCompareHashmapResponse>(
    `${priceCompareBaseUrl}/global-comparison/hashmap`,
    [priceCompareBaseUrl, "global-comparison", "hashmap"],
    true,
  );
}
