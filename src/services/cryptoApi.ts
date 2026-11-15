
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

export const cryptoApi = createApi({
  reducerPath: "cryptoApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.coingecko.com/api/v3/",
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
  }),
});

export const { useGetCoinsMarketsQuery } = cryptoApi;
