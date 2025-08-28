import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Items from "./Items";
import ItemDetail from "./ItemDetail";
import Stats from "./Stats";
import { DataProvider } from "../state/DataContext";
import "../styles/App.css";
import "../styles/Navigation.css";

function App() {
  return (
    <DataProvider>
      <nav className="nav-header">
        <Link to="/" className="nav-link">
          Items
        </Link>
        <Link to="/stats" className="nav-link">
          Stats
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </DataProvider>
  );
}

export default App;
