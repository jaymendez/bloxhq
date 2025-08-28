import React, { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import "../styles/Items.css";

function Items() {
  const { items, fetchItems, error, totalCount } = useData();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchString, setSearchString] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate total pages
  const totalPages = totalCount
    ? Math.ceil(totalCount / pageSize)
    : items.length < pageSize
    ? page
    : page + 1;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchItems(controller.signal, { page, pageSize, searchString })
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => {
      controller.abort();
    };
  }, [fetchItems, page, pageSize, searchString]);

  const handleSearch = (e) => {
    setSearchString(e.target.value);
    setPage(1);
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  const Row = ({ index, style }) => {
    const item = items[index];
    if (!item) return null;
    return (
      <div
        className={`item-row ${
          index % 2 === 0 ? "item-row-even" : "item-row-odd"
        }`}
        style={style} // Keep this for react-window positioning
      >
        <Link to={`/items/${item.id}`} className="item-link">
          {item.name}
          {item.price && (
            <span className="item-price">
              $
              {typeof item.price === "number"
                ? item.price.toFixed(2)
                : item.price}
            </span>
          )}
        </Link>
      </div>
    );
  };

  const isNextDisabled = page >= totalPages && items.length < pageSize;

  return (
    <div className="items-container">
      <h1>Items List</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search items..."
          value={searchString}
          onChange={handleSearch}
          className="search-input"
          aria-label="Search items"
        />
        {searchString && (
          <button
            onClick={() => setSearchString("")}
            className="clear-search"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <div>Loading items...</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      ) : items.length > 0 ? (
        <div className="items-list">
          <List
            height={400}
            itemCount={items.length}
            itemSize={50}
            width="100%"
            style={{ overflowX: "hidden" }} // Keep this inline style for react-window
          >
            {Row}
          </List>
        </div>
      ) : (
        <div className="no-items">
          No items found {searchString ? `matching "${searchString}"` : ""}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className={`pagination-button ${
            page === 1
              ? "pagination-button-disabled"
              : "pagination-button-enabled"
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span className="page-info">
          Page {page} of {totalPages || "?"}
          {totalCount > 0 && (
            <span className="total-count">({totalCount} total items)</span>
          )}
        </span>
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`pagination-button ${
            isNextDisabled
              ? "pagination-button-disabled"
              : "pagination-button-enabled"
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {/* Error display */}
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default Items;
