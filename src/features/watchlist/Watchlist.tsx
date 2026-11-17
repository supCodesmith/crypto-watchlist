
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { coinAdded, coinRemoved } from "./watchlistSlice";

import {
  useGetCoinsMarketsQuery,
  useSearchCoinsQuery,
  type CoinMarketData,
} from "../../services/cryptoApi";

function Watchlist() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const dispatch = useAppDispatch();

  const coinIds = useAppSelector(
    (state) => state.watchlist.coinIds
  );

  // Debounce cryptocurrency search.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Search for cryptocurrencies.
  const {
    data: searchData,
    isFetching: isSearching,
    isError: searchError,
  } = useSearchCoinsQuery(debouncedSearch, {
    skip: debouncedSearch.length < 2,
  });

  // Fetch and automatically refresh market data.
  const {
    data: coins = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCoinsMarketsQuery(coinIds, {
    skip: coinIds.length === 0,
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const handleAdd = (coinId: string) => {
    dispatch(coinAdded(coinId));
  };

  const handleRemove = (coinId: string) => {
    dispatch(coinRemoved(coinId));
  };

  const formatUsd = (value: number | null, decimals = 2) => {
    if (value === null) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Maintain the order of coins in the watchlist.
  const orderedCoins = coinIds
    .map((id) => coins.find((coin) => coin.id === id))
    .filter((coin): coin is CoinMarketData => Boolean(coin));

  const searchResults = searchData?.coins ?? [];

  return (
    <main>
      <section>
        <h2>Find a Cryptocurrency</h2>

        <input
          type="text"
          placeholder="Search Bitcoin, Ethereum, BTC..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        {searchInput.trim().length < 2 && (
          <p>Enter at least 2 characters to search.</p>
        )}

        {isSearching && <p>Searching cryptocurrencies...</p>}

        {searchError && (
          <p>Unable to search. Please try again.</p>
        )}

        {!isSearching &&
          !searchError &&
          debouncedSearch.length >= 2 &&
          searchResults.length === 0 && (
            <p>No matching cryptocurrencies found.</p>
          )}

        <ul>
          {searchResults.slice(0, 10).map((coin) => {
            const isAlreadyAdded = coinIds.includes(coin.id);

            return (
              <li key={coin.id}>
                <img
                  src={coin.thumb}
                  alt={coin.name}
                  width="28"
                  height="28"
                />

                <strong>{coin.name}</strong>

                <span>({coin.symbol.toUpperCase()})</span>

                <span>
                  {coin.market_cap_rank
                    ? `Rank #${coin.market_cap_rank}`
                    : "Rank unavailable"}
                </span>

                <button
                  onClick={() => handleAdd(coin.id)}
                  disabled={isAlreadyAdded}
                >
                  {isAlreadyAdded ? "Added" : "Add to Watchlist"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <hr />

      <section>
        <div>
          <h2>Your Crypto Watchlist</h2>

          <button
            onClick={() => refetch()}
            disabled={isFetching || coinIds.length === 0}
          >
            {isFetching ? "Updating..." : "Refresh Prices"}
          </button>
        </div>

        {isLoading && <p>Loading market data...</p>}

        {isFetching && !isLoading && (
          <p>Updating cryptocurrency prices...</p>
        )}

        {isError && (
          <p>Unable to fetch market data. Please try again.</p>
        )}

        {coinIds.length === 0 && (
          <p>Your watchlist is empty. Search for a coin above.</p>
        )}

        {!isLoading &&
          !isError &&
          coinIds.length > 0 &&
          orderedCoins.length === 0 && (
            <p>No market data found for your saved coins.</p>
          )}

        <ul>
          {orderedCoins.map((coin) => {
            const priceChange = coin.price_change_percentage_24h;

            return (
              <li key={coin.id}>
                <img
                  src={coin.image}
                  alt={coin.name}
                  width="32"
                  height="32"
                />

                <h3>{coin.name}</h3>

                <p>Symbol: {coin.symbol.toUpperCase()}</p>

                <p>
                  Price: {formatUsd(coin.current_price, 8)}
                </p>

                <p>
                  24h Change:{" "}
                  {priceChange === null
                    ? "N/A"
                    : `${priceChange.toFixed(2)}%`}
                </p>

                <p>
                  Market Cap: {formatUsd(coin.market_cap, 0)}
                </p>

                <button onClick={() => handleRemove(coin.id)}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>

        <p>Market data provided by CoinGecko.</p>
      </section>
    </main>
  );
}

export default Watchlist;
