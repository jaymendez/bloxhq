import React, { createContext, useCallback, useContext, useState } from "react";
import api from "../utils/api"; // Import the custom API utility

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchItems = useCallback(
    async (signal, { page = 1, pageSize = 20, searchString = "" } = {}) => {
      try {
        setError(null);
        const params = new URLSearchParams();
        params.append("limit", pageSize);
        params.append("offset", (page - 1) * pageSize);
        params.append("includeTotalCount", "true");
        if (searchString) {
          params.append("q", searchString);
        }

        const data = await api.fetch(`/items?${params.toString()}`, { signal });

        if (data.items && typeof data.totalCount === "number") {
          setItems(data.items);
          setTotalCount(data.totalCount);
        } else {
          setItems(data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
          setError(err.message);
        }
      }
    },
    []
  );

  return (
    <DataContext.Provider
      value={{
        items,
        fetchItems,
        error,
        totalCount,
        isLoading: false, // We'll manage loading state in the Items component
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
