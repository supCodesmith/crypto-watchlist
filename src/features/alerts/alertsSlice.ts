
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  targetPrice: number;
  condition: "above" | "below";
  isTriggered: boolean;
}

interface AlertsState {
  alerts: PriceAlert[];
}

interface AlertUpdatePayload {
  id: string;
  targetPrice: number;
  condition: "above" | "below";
}

const loadSavedAlerts = (): PriceAlert[] => {
  try {
    const savedAlerts = localStorage.getItem("crypto-price-alerts");

    if (!savedAlerts) return [];

    const parsed: unknown = JSON.parse(savedAlerts);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (alert): alert is PriceAlert =>
        typeof alert.id === "string" &&
        typeof alert.coinId === "string" &&
        typeof alert.coinName === "string" &&
        typeof alert.targetPrice === "number" &&
        Number.isFinite(alert.targetPrice) &&
        (alert.condition === "above" || alert.condition === "below") &&
        typeof alert.isTriggered === "boolean"
    );
  } catch {
    return [];
  }
};

const initialState: AlertsState = {
  alerts: loadSavedAlerts(),
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    alertAdded: (state, action: PayloadAction<PriceAlert>) => {
      state.alerts.push(action.payload);
    },

    alertRemoved: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },

    alertTriggered: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(
        (item) => item.id === action.payload
      );

      if (alert) {
        alert.isTriggered = true;
      }
    },

    alertUpdated: (
      state,
      action: PayloadAction<AlertUpdatePayload>
    ) => {
      const alert = state.alerts.find(
        (item) => item.id === action.payload.id
      );

      if (alert) {
        alert.targetPrice = action.payload.targetPrice;
        alert.condition = action.payload.condition;
        alert.isTriggered = false;
      }
    },

    alertReset: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(
        (item) => item.id === action.payload
      );

      if (alert) {
        alert.isTriggered = false;
      }
    },
  },
});

export const {
  alertAdded,
  alertRemoved,
  alertTriggered,
  alertUpdated,
  alertReset,
} = alertsSlice.actions;

export default alertsSlice.reducer;
