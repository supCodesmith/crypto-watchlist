
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import watchlistReducer from "../features/watchlist/watchlistSlice";
import alertsReducer from "../features/alerts/alertsSlice";
import { cryptoApi } from "../services/cryptoApi";

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
    alerts: alertsReducer,
    [cryptoApi.reducerPath]: cryptoApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cryptoApi.middleware),
});

setupListeners(store.dispatch);

store.subscribe(() => {
  try {
    const alerts = store.getState().alerts.alerts;

    localStorage.setItem(
      "crypto-price-alerts",
      JSON.stringify(alerts)
    );
  } catch (error) {
    console.error("Unable to save price alerts:", error);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
