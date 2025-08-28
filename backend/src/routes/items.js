const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Utility to read data (now async)
async function readData() {
  const raw = await fs.readFile(DATA_PATH);
  return JSON.parse(raw);
}

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const {
      limit = 20,
      offset = 0,
      q = "",
      includeTotalCount = false,
    } = req.query;
    let filteredResults = data;

    // Apply search filter if query provided
    if (q) {
      filteredResults = filteredResults.filter((item) =>
        item.name.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Pagination
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedResults = filteredResults.slice(start, end);
    // Response format depends on includeTotalCount parameter
    if (includeTotalCount === "true") {
      res.json({
        items: paginatedResults,
        totalCount: filteredResults.length,
        page: Math.floor(start / parseInt(limit)) + 1,
        pageSize: parseInt(limit),
      });
    } else {
      res.json(paginatedResults);
    }
  } catch (err) {
    console.error("Error fetching items:", err);
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    // Check required fields
    if (!name || name.trim() === "") {
      const err = new Error("Item name is required");
      err.status = 400;
      throw err;
    }

    // Validate price is a positive number if provided
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      const err = new Error("Price must be a positive number");
      err.status = 400;
      throw err;
    }

    // Validate category if provided
    if (category !== undefined && typeof category !== "string") {
      const err = new Error("Category must be a string");
      err.status = 400;
      throw err;
    }

    const item = {
      name,
      price: price || 0,
      category: category || "uncategorized",
    };

    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
