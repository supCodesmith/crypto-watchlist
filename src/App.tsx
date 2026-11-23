
import Watchlist from "./features/watchlist/Watchlist";
import Alerts from "./features/alerts/Alerts";
import PriceChart from "./features/charts/PriceChart";

function App() {
  return (
    <main>
      <h1>Crypto Watchlist</h1>
      <Watchlist />
      <Alerts />
      <PriceChart />
    </main>
  );
}

export default App;
