
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAppSelector } from "../../app/hooks";
import { useGetCoinPriceHistoryQuery } from "../../services/cryptoApi";

function PriceChart() {
  const coinIds = useAppSelector(
    (state) => state.watchlist.coinIds
  );

  const [selectedCoin, setSelectedCoin] = useState(
    coinIds[0] ?? ""
  );

  const [days, setDays] = useState<"1" | "7" | "30">("7");

  useEffect(() => {
    if (coinIds.length === 0) {
      setSelectedCoin("");
      return;
    }

    if (!coinIds.includes(selectedCoin)) {
      setSelectedCoin(coinIds[0]);
    }
  }, [coinIds, selectedCoin]);

  const {
    currentData,
    isLoading,
    isFetching,
    isError,
  } = useGetCoinPriceHistoryQuery(
    {
      coinId: selectedCoin,
      days,
    },
    {
      skip: !selectedCoin,
    }
  );

  const chartData = (currentData?.prices ?? []).map(
    ([timestamp, price]) => ({
      timestamp,
      price,
    })
  );

  const prices = chartData.map((item) => item.price);

  const highestPrice =
    prices.length > 0 ? Math.max(...prices) : 0;

  const lowestPrice =
    prices.length > 0 ? Math.min(...prices) : 0;

  const averagePrice =
    prices.length > 0
      ? prices.reduce((total, price) => total + price, 0) /
        prices.length
      : 0;

  const firstPrice = prices[0] ?? 0;
  const latestPrice = prices[prices.length - 1] ?? 0;

  const periodChange =
    firstPrice > 0
      ? ((latestPrice - firstPrice) / firstPrice) * 100
      : 0;

  const formatUsd = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4,
    }).format(value);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <section>
      <h2>Cryptocurrency Price History</h2>

      {coinIds.length === 0 ? (
        <p>Add a cryptocurrency to your watchlist to view its price chart.</p>
      ) : (
        <>
          <div>
            <label htmlFor="chart-coin">Select Cryptocurrency</label>

            <select
              id="chart-coin"
              value={selectedCoin}
              onChange={(event) =>
                setSelectedCoin(event.target.value)
              }
            >
              {coinIds.map((coinId) => (
                <option key={coinId} value={coinId}>
                  {coinId.charAt(0).toUpperCase() + coinId.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setDays("1")}
              disabled={days === "1"}
            >
              24 Hours
            </button>

            <button
              type="button"
              onClick={() => setDays("7")}
              disabled={days === "7"}
            >
              7 Days
            </button>

            <button
              type="button"
              onClick={() => setDays("30")}
              disabled={days === "30"}
            >
              30 Days
            </button>
          </div>

          {isLoading && <p>Loading price history...</p>}

          {isFetching && !isLoading && (
            <p>Updating chart...</p>
          )}

          {isError && (
            <p>Unable to load price history. Please try again.</p>
          )}

          {!isLoading && !isError && chartData.length > 0 && (
            <>
              <div>
                <div>
                  <h3>Highest Price</h3>
                  <p>{formatUsd(highestPrice)}</p>
                </div>

                <div>
                  <h3>Lowest Price</h3>
                  <p>{formatUsd(lowestPrice)}</p>
                </div>

                <div>
                  <h3>Average Price</h3>
                  <p>{formatUsd(averagePrice)}</p>
                </div>

                <div>
                  <h3>Period Change</h3>
                  <p>
                    {periodChange >= 0 ? "+" : ""}
                    {periodChange.toFixed(2)}%
                  </p>
                </div>
              </div>

              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={formatDate}
                      minTickGap={30}
                    />

                    <YAxis
                      domain={["auto", "auto"]}
                      tickFormatter={(value) =>
                        formatUsd(Number(value))
                      }
                      width={100}
                    />

                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(Number(value)).toLocaleString()
                      }
                      formatter={(value) =>
                        formatUsd(Number(value))
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {!isLoading &&
            !isError &&
            chartData.length === 0 && (
              <p>No historical price data available.</p>
            )}
        </>
      )}
    </section>
  );
}

export default PriceChart;
