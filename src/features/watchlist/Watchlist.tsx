
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: searchData,
    isFetching: isSearching,
    isError: searchError,
  } = useSearchCoinsQuery(debouncedSearch, {
    skip: debouncedSearch.length < 2,
  });

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

  const orderedCoins = coinIds
    .map((id) => coins.find((coin) => coin.id === id))
    .filter((coin): coin is CoinMarketData => Boolean(coin));

  const searchResults = searchData?.coins ?? [];

  return (
    <div className="watchlist-container">
      <section className="search-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EXPLORE</span>
            <h2>Find a cryptocurrency</h2>
            <p>Search for coins and add them to your watchlist.</p>
          </div>
        </div>

        <input
          className="crypto-search"
          type="text"
          placeholder="Search Bitcoin, Ethereum, BTC..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          aria-label="Search cryptocurrencies"
        />

        {searchInput.trim().length < 2 && (
          <p className="helper-text">
            Enter at least 2 characters to search.
          </p>
        )}

        {isSearching && (
          <p className="helper-text">Searching cryptocurrencies...</p>
        )}

        {searchError && (
          <p className="error-message">
            Unable to search. Please try again.
          </p>
        )}

        {!isSearching &&
          !searchError &&
          debouncedSearch.length >= 2 &&
          searchResults.length === 0 && (
            <p className="helper-text">
              No matching cryptocurrencies found.
            </p>
          )}

        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.slice(0, 10).map((coin) => {
              const isAlreadyAdded = coinIds.includes(coin.id);

              return (
                <li key={coin.id} className="search-result-row">
                  <div className="coin-identity">
                    <img
                      src={coin.thumb}
                      alt=""
                      width="36"
                      height="36"
                    />

                    <div>
                      <strong>{coin.name}</strong>
                      <span>
                        {coin.symbol.toUpperCase()} ·{" "}
                        {coin.market_cap_rank
                          ? `Rank #${coin.market_cap_rank}`
                          : "Rank unavailable"}
                      </span>
                    </div>
                  </div>

                  <button
                    className="add-coin-button"
                    type="button"
                    onClick={() => handleAdd(coin.id)}
                    disabled={isAlreadyAdded}
                  >
                    {isAlreadyAdded ? "Added" : "+ Add"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="watchlist-panel">
        <div className="section-heading watchlist-heading">
          <div>
            <span className="eyebrow">YOUR PORTFOLIO</span>
            <h2>Your watchlist</h2>
            <p>
              Track prices and market movements in one place.
            </p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || coinIds.length === 0}
          >
            <span>↻</span>
            {isFetching ? "Updating..." : "Refresh"}
          </button>
        </div>

        {isLoading && (
          <p className="helper-text">Loading market data...</p>
        )}

        {isFetching && !isLoading && (
          <p className="helper-text">
            Updating cryptocurrency prices...
          </p>
        )}

        {isError && (
          <p className="error-message">
            Unable to fetch market data. Please try again.
          </p>
        )}

        {coinIds.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">◈</span>
            <h3>Your watchlist is empty</h3>
            <p>Search for a cryptocurrency above to get started.</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          coinIds.length > 0 &&
          orderedCoins.length === 0 && (
            <p className="helper-text">
              No market data found for your saved coins.
            </p>
          )}

        {orderedCoins.length > 0 && (
          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Market Cap</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orderedCoins.map((coin) => {
                  const priceChange =
                    coin.price_change_percentage_24h;

                  const changeClass =
                    priceChange === null
                      ? "change-neutral"
                      : priceChange >= 0
                        ? "change-positive"
                        : "change-negative";

                  return (
                    <tr key={coin.id}>
                      <td>
                        <div className="coin-identity">
                          <img
                            src={coin.image}
                            alt=""
                            width="38"
                            height="38"
                          />

                          <div>
                            <strong>{coin.name}</strong>
                            <span>
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="price-cell">
                        {formatUsd(coin.current_price, 8)}
                      </td>

                      <td>
                        <span className={`price-change ${changeClass}`}>
                          {priceChange === null
                            ? "N/A"
                            : `${priceChange >= 0 ? "+" : ""}${priceChange.toFixed(2)}%`}
                        </span>
                      </td>

                      <td className="market-cap-cell">
                        {formatUsd(coin.market_cap, 0)}
                      </td>

                      <td>
                        <button
                          className="remove-coin-button"
                          type="button"
                          onClick={() => handleRemove(coin.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="data-source">
          Market data provided by CoinGecko.
        </p>
      </section>
    </div>
  );
}

export default Watchlist;
