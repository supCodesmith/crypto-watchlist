
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
    // Fetch market data for selected coins.
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

    // Search for cryptocurrencies by name or symbol.
    searchCoins: builder.query<CoinSearchResponse, string>({
      query: (searchTerm) => ({
        url: "search",
        params: {
          query: searchTerm,
        },
      }),
    }),
  }),
});

export const {
  useGetCoinsMarketsQuery,
  useSearchCoinsQuery,
} = cryptoApi;