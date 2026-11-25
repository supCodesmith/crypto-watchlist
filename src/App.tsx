
import { useEffect, useState } from "react";

import Watchlist from "./features/watchlist/Watchlist";
import Alerts from "./features/alerts/Alerts";
import PriceChart from "./features/charts/PriceChart";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("crypto-dashboard-theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("crypto-dashboard-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "light" ? "dark" : "light"
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">₿</div>
          <span>CoinTrack</span>
        </div>

        <p className="nav-label">MENU</p>

        <nav className="sidebar-nav">
          <a className="nav-link active" href="#overview">
            <span>⌂</span>
            Overview
          </a>

          <a className="nav-link" href="#watchlist">
            <span>◈</span>
            Watchlist
          </a>

          <a className="nav-link" href="#charts">
            <span>▥</span>
            Price Charts
          </a>

          <a className="nav-link" href="#alerts">
            <span>♧</span>
            Price Alerts
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>Crypto Watchlist</p>
          <span>Track your market.</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back. Here's your crypto overview.</p>
          </div>

          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
          </button>
        </header>

        <div className="dashboard-content" id="overview">
          <section id="watchlist" className="dashboard-section">
            <Watchlist />
          </section>

          <section id="charts" className="dashboard-section">
            <PriceChart />
          </section>

          <section id="alerts" className="dashboard-section">
            <Alerts />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
