
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface WatchlistState {
  coinIds: string[];
}

interface CoinMovedPayload {
  fromIndex: number;
  toIndex: number;
}

const initialState: WatchlistState = {
  coinIds: ["bitcoin", "ethereum", "solana"],
};

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    coinAdded: (state, action: PayloadAction<string>) => {
      const coinId = action.payload.toLowerCase();

      if (!state.coinIds.includes(coinId)) {
        state.coinIds.push(coinId);
      }
    },

    coinRemoved: (state, action: PayloadAction<string>) => {
      state.coinIds = state.coinIds.filter(
        (coinId) => coinId !== action.payload
      );
    },

    coinMoved: (
      state,
      action: PayloadAction<CoinMovedPayload>
    ) => {
      const { fromIndex, toIndex } = action.payload;

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= state.coinIds.length ||
        toIndex >= state.coinIds.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const [movedCoin] = state.coinIds.splice(fromIndex, 1);
      state.coinIds.splice(toIndex, 0, movedCoin);
    },
  },
});

export const { coinAdded, coinRemoved, coinMoved } =
  watchlistSlice.actions;

export default watchlistSlice.reducer;
