
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number | null;
}

interface CoinSearchResponse {
  coins: CoinSearchResult[];
}

export interface HistoricalPriceData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface PriceHistoryParams {
  coinId: string;
  days: "1" | "7" | "30";
}

export const cryptoApi = createApi({
  reducerPath: "cryptoApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.coingecko.com/api/v3/",

    prepareHeaders: (headers) => {
      const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;

      if (apiKey) {
        headers.set("x-cg-demo-api-key", apiKey);
      }

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getCoinsMarkets: builder.query<CoinMarketData[], string[]>({
      query: (coinIds) => ({
        url: "coins/markets",
        params: {
          vs_currency: "usd",
          ids: coinIds.join(","),
          price_change_percentage: "24h",
        },
      }),
    }),

    searchCoins: builder.query<CoinSearchResponse, string>({
      query: (searchTerm) => ({
        url: "search",
        params: {
          query: searchTerm,
        },
      }),
    }),

    getCoinPriceHistory: builder.query<
      HistoricalPriceData,
      PriceHistoryParams
    >({
      query: ({ coinId, days }) => ({
        url: `coins/${coinId}/market_chart`,
        params: {
          vs_currency: "usd",
          days,
        },
      }),
    }),
  }),
});

export const {
  useGetCoinsMarketsQuery,
  useSearchCoinsQuery,
  useGetCoinPriceHistoryQuery,
} = cryptoApi;
