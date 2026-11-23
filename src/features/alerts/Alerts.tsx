
import { useEffect, useState, type FormEvent } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  alertAdded,
  alertRemoved,
  alertTriggered,
  alertUpdated,
  alertReset,
} from "./alertsSlice";

import { useGetCoinsMarketsQuery } from "../../services/cryptoApi";

function Alerts() {
  const dispatch = useAppDispatch();

  const coinIds = useAppSelector(
    (state) => state.watchlist.coinIds
  );

  const alerts = useAppSelector(
    (state) => state.alerts.alerts
  );

  const [selectedCoin, setSelectedCoin] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"above" | "below">("above");

  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [editTargetPrice, setEditTargetPrice] = useState("");
  const [editCondition, setEditCondition] = useState<"above" | "below">("above");

  const [permission, setPermission] = useState(
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission
  );

  const {
    data: coins = [],
    isLoading,
    isError,
  } = useGetCoinsMarketsQuery(coinIds, {
    skip: coinIds.length === 0,
    pollingInterval: 60000,
  });

  const formatUsd = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 8,
    }).format(price);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.isTriggered || permission !== "granted") return;

      const coin = coins.find(
        (item) => item.id === alert.coinId
      );

      if (!coin || coin.current_price === null) return;

      const isConditionMet =
        alert.condition === "above"
          ? coin.current_price >= alert.targetPrice
          : coin.current_price <= alert.targetPrice;

      if (isConditionMet) {
        try {
          new Notification(`${alert.coinName} price alert`, {
            body: `${alert.coinName} is now ${formatUsd(
              coin.current_price
            )}. Your target was ${formatUsd(alert.targetPrice)}.`,
          });

          dispatch(alertTriggered(alert.id));
        } catch (error) {
          console.error("Unable to send notification:", error);
        }
      }
    });
  }, [alerts, coins, dispatch, permission]);

  const handleAddAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(targetPrice);

    if (!selectedCoin || !Number.isFinite(price) || price <= 0) {
      return;
    }

    dispatch(
      alertAdded({
        id: crypto.randomUUID(),
        coinId: selectedCoin,
        coinName: selectedCoin
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        targetPrice: price,
        condition,
        isTriggered: false,
      })
    );

    setSelectedCoin("");
    setTargetPrice("");
    setCondition("above");
  };

  const handleEdit = (
    id: string,
    currentPrice: number,
    currentCondition: "above" | "below"
  ) => {
    setEditingAlertId(id);
    setEditTargetPrice(String(currentPrice));
    setEditCondition(currentCondition);
  };

  const handleUpdateAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const price = Number(editTargetPrice);

    if (!editingAlertId || !Number.isFinite(price) || price <= 0) {
      return;
    }

    dispatch(
      alertUpdated({
        id: editingAlertId,
        targetPrice: price,
        condition: editCondition,
      })
    );

    setEditingAlertId(null);
    setEditTargetPrice("");
  };

  const handleCancelEdit = () => {
    setEditingAlertId(null);
    setEditTargetPrice("");
  };

  return (
    <section>
      <h2>Price Alerts</h2>

      <div>
        <p>Notification permission: {permission}</p>

        <button
          type="button"
          onClick={requestNotificationPermission}
          disabled={permission === "granted" || permission === "unsupported"}
        >
          {permission === "granted"
            ? "Notifications Enabled"
            : "Enable Notifications"}
        </button>
      </div>

      <form onSubmit={handleAddAlert}>
        <div>
          <label htmlFor="alert-coin">Select Cryptocurrency</label>

          <select
            id="alert-coin"
            value={selectedCoin}
            onChange={(event) => setSelectedCoin(event.target.value)}
            required
          >
            <option value="">Choose a coin</option>

            {coinIds.map((coinId) => (
              <option key={coinId} value={coinId}>
                {coinId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="target-price">Target Price (USD)</label>

          <input
            id="target-price"
            type="number"
            min="0"
            step="any"
            placeholder="Enter target price"
            value={targetPrice}
            onChange={(event) => setTargetPrice(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="alert-condition">Condition</label>

          <select
            id="alert-condition"
            value={condition}
            onChange={(event) =>
              setCondition(event.target.value as "above" | "below")
            }
          >
            <option value="above">Price goes above</option>
            <option value="below">Price goes below</option>
          </select>
        </div>

        <button type="submit" disabled={coinIds.length === 0}>
          Add Alert
        </button>
      </form>

      <h3>Your Saved Alerts</h3>

      {isLoading && <p>Loading prices...</p>}
      {isError && <p>Unable to load prices for alert monitoring.</p>}

      {alerts.length === 0 ? (
        <p>No price alerts created yet.</p>
      ) : (
        <ul>
          {alerts.map((alert) => {
            const coin = coins.find(
              (item) => item.id === alert.coinId
            );

            const currentPrice = coin?.current_price ?? null;

            const conditionMet =
              currentPrice !== null &&
              (alert.condition === "above"
                ? currentPrice >= alert.targetPrice
                : currentPrice <= alert.targetPrice);

            return (
              <li key={alert.id}>
                <strong>{alert.coinName}</strong>

                <p>
                  {alert.condition === "above" ? "Above" : "Below"}{" "}
                  {formatUsd(alert.targetPrice)}
                </p>

                <p>
                  Current Price:{" "}
                  {currentPrice !== null
                    ? formatUsd(currentPrice)
                    : "Loading..."}
                </p>

                <p>
                  Status: {alert.isTriggered ? "Triggered" : "Active"}
                </p>

                {editingAlertId === alert.id ? (
                  <form onSubmit={handleUpdateAlert}>
                    <div>
                      <label htmlFor={`edit-price-${alert.id}`}>
                        New Target Price
                      </label>

                      <input
                        id={`edit-price-${alert.id}`}
                        type="number"
                        min="0"
                        step="any"
                        value={editTargetPrice}
                        onChange={(event) =>
                          setEditTargetPrice(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor={`edit-condition-${alert.id}`}>
                        New Condition
                      </label>

                      <select
                        id={`edit-condition-${alert.id}`}
                        value={editCondition}
                        onChange={(event) =>
                          setEditCondition(
                            event.target.value as "above" | "below"
                          )
                        }
                      >
                        <option value="above">Price goes above</option>
                        <option value="below">Price goes below</option>
                      </select>
                    </div>

                    <button type="submit">Save Changes</button>

                    <button type="button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          alert.id,
                          alert.targetPrice,
                          alert.condition
                        )
                      }
                    >
                      Edit Alert
                    </button>

                    {alert.isTriggered && (
                      <button
                        type="button"
                        disabled={conditionMet || currentPrice === null}
                        onClick={() => dispatch(alertReset(alert.id))}
                      >
                        Reset Alert
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => dispatch(alertRemoved(alert.id))}
                >
                  Remove
                </button>

                {alert.isTriggered && conditionMet && (
                  <p>
                    The target condition is still met. Wait for the price
                    to move back before resetting this alert.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default Alerts;
