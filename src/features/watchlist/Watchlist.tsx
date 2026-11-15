
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { coinAdded, coinRemoved } from "./watchlistSlice";
import { useGetCoinsMarketsQuery } from "../../services/cryptoApi";

function Watchlist() {
  const [coinInput, setCoinInput] = useState("");

  const coinIds = useAppSelector(
    (state) => state.watchlist.coinIds
  );

  const dispatch = useAppDispatch();

  const {
    data: coins = [],
    isLoading,
    isFetching,
    isError,
  } = useGetCoinsMarketsQuery(coinIds, {
    skip: coinIds.length === 0,
  });

  const handleAdd = () => {
    const coinId = coinInput.trim().toLowerCase();

    if (!coinId) return;

    dispatch(coinAdded(coinId));
    setCoinInput("");
  };

  const handleRemove = (coinId: string) => {
    dispatch(coinRemoved(coinId));
  };

  const formatUsd = (value: number | null) => {
    if (value === null) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div>
      <h2>Your Crypto Watchlist</h2>

      <input
        type="text"
        placeholder="Enter coin ID, e.g. dogecoin"
        value={coinInput}
        onChange={(event) => setCoinInput(event.target.value)}
      />

      <button onClick={handleAdd}>Add Coin</button>

      {isLoading && <p>Loading market data...</p>}

      {isFetching && !isLoading && (
        <p>Refreshing market data...</p>
      )}

      {isError && (
        <p>Unable to fetch cryptocurrency data. Please try again later.</p>
      )}

      {!isLoading && coinIds.length === 0 && (
        <p>Your watchlist is empty.</p>
      )}

      <ul>
        {coins.map((coin) => (
          <li key={coin.id}>
            <img src={coin.image} alt={coin.name} width="24" />

            <strong>{coin.name}</strong>
            <span>({coin.symbol.toUpperCase()})</span>

            <p>Price: {formatUsd(coin.current_price)}</p>

            <p>
              24h Change:{" "}
              {coin.price_change_percentage_24h === null
                ? "N/A"
                : `${coin.price_change_percentage_24h.toFixed(2)}%`}
            </p>

            <p>Market Cap: {formatUsd(coin.market_cap)}</p>

            <button onClick={() => handleRemove(coin.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p>Market data provided by CoinGecko.</p>
    </div>
  );
}

export default Watchlist;
