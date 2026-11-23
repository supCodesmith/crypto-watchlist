import Watchlist from "./features/watchlist/Watchlist";
import Alerts from "./features/alerts/Alerts";

function App() {
  return (
    <main>
      <h1>Crypto Watchlist</h1>
      <Watchlist />
      <Alerts />
    </main>
  );
}

export default App;