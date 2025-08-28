const express = require("express");
const { watch, promises } = require("fs"); // Still need standard fs for watch
const path = require("path");
const { mean } = require("../utils/stats"); // Import the mean utility function
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json"); // Fix path - match the path in items.js

let cachedStats = null;
let lastUpdated = null;
let updatePromise = null;

function computeStats(items) {
  const prices = items.map((item) => item.price || 0);

  return {
    total: items.length,
    averagePrice: mean(prices), // Use the mean utility function
    lastUpdated: new Date().toISOString(),
  };
}

// We have 2 ways of updating cache
// - Through file changes on items.json
// - Through API calls checking if cache is stale
async function updateCache() {
  // If an update is in progress, return that promise
  if (updatePromise) return updatePromise;

  updatePromise = (async () => {
    try {
      const raw = await promises.readFile(DATA_PATH, "utf8");
      const items = JSON.parse(raw);
      cachedStats = computeStats(items);
      lastUpdated = new Date();
      return cachedStats;
    } catch (err) {
      console.error("Error updating stats cache:", err);
      throw err;
    } finally {
      updatePromise = null;
    }
  })();

  return updatePromise;
}

// Watch for file changes
watch(DATA_PATH, (eventType) => {
  if (eventType === "change") {
    console.log("Items data changed, updating stats cache...");
    updateCache().catch((err) => {
      console.error("Failed to update stats cache:", err);
    });
  }
});

// Initialize cache
updateCache().catch((err) => {
  console.error("Failed to initialize stats cache:", err);
});

router.get("/", async (req, res, next) => {
  try {
    // If we have a cache and it's less than 5 minutes old, return it
    // change if needed to test caching.
    const cacheIsValid =
      cachedStats && lastUpdated && new Date() - lastUpdated < ONE_MINUTE * 5;

    if (cacheIsValid) {
      return res.json(cachedStats);
    }

    // Otherwise, update the cache and return fresh stats
    const stats = await updateCache();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
