import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/ItemDetail.css";
import { sleep } from "../utils/delay";

function ItemDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate loading
      // await sleep(500);
      const data = await api.get(`/items/${id}`);
      setItem(data);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  // Error page incase of 404
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Item</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")} className="error-button">
          Back to Items List
        </button>
      </div>
    );
  }

  if (loading || !item) {
    return (
      <div className="loading-container">
        <div>Loading item details...</div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="item-detail-container">
      <button onClick={() => navigate("/")} className="back-button">
        ← Back to List
      </button>

      <h2 className="item-title">{item.name}</h2>

      {item.category && (
        <p className="item-property">
          <strong>Category:</strong> {item.category}
        </p>
      )}

      {typeof item.price !== "undefined" && (
        <p className="item-property">
          <strong>Price:</strong> $
          {typeof item.price === "number" ? item.price.toFixed(2) : item.price}
        </p>
      )}
    </div>
  );
}

export default ItemDetail;
