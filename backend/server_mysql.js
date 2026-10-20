require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// Database Connection Pool (MySQL)
// ============================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "std6730251069",
  password: process.env.DB_PASSWORD || "K6#qvHxP",
  database: process.env.DB_NAME || "ip_std6730251069",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ============================================================
// Phase 1: Authentication (Login)
// ============================================================
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password123") {
    return res.status(200).json({ success: true, token: "mock-jwt-token" });
  }

  return res.status(401).json({ success: false, message: "Invalid username or password" });
});

// ============================================================
// Phase 2: K-Means Salary Clustering (Must be before /:id)
// ============================================================
app.get("/api/employees/salary-clusters", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT salary FROM employees");
    const salaries = rows.map((r) => Number(r.salary));

    if (salaries.length === 0) {
      return res.status(200).json({ success: true, clusters: [] });
    }

    const k = 3;
    const result = kMeansClustering(salaries, k);

    res.status(200).json({
      success: true,
      clusters: result.map((c, i) => ({
        group: `Tier ${i + 1}`,
        centroid: Math.round(c.centroid),
        count: c.count,
      })),
    });
  } catch (error) {
    console.error("Cluster error:", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
});

// ============================================================
// Phase 1: CRUD Endpoints with MySQL
// ============================================================

// GET - Return all employees
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, position, status, salary FROM employees ORDER BY id ASC");
    res.status(200).json(rows.map((r) => ({ ...r, id: String(r.id), salary: Number(r.salary) })));
  } catch (error) {
    console.error("Fetch employees error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// POST - Add a new employee
app.post("/api/employees", async (req, res) => {
  const { name, position, salary } = req.body;

  if (!name || !position || salary === undefined || salary === null || salary === "") {
    return res.status(400).json({ success: false, message: "All fields (name, position, salary) are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO employees (name, position, status, salary) VALUES (?, ?, 'Active', ?)",
      [name.trim(), position.trim(), Number(salary)]
    );

    const newEmployee = {
      id: String(result.insertId),
      name: name.trim(),
      position: position.trim(),
      status: "Active",
      salary: Number(salary),
    };

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Insert employee error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// PUT - Toggle employee status (Active <-> On Leave)
app.put("/api/employees/:id/status", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM employees WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "Active" ? "On Leave" : "Active";

    await pool.query("UPDATE employees SET status = ? WHERE id = ?", [newStatus, req.params.id]);

    res.status(200).json({ ...rows[0], id: String(rows[0].id), status: newStatus });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// DELETE - Remove employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ============================================================
// K-Means Clustering Algorithm (1D)
// ============================================================
function kMeansClustering(data, k) {
  if (data.length <= k) {
    const sorted = [...data].sort((a, b) => a - b);
    return sorted.map((d) => ({ centroid: d, count: 1 }));
  }

  const sorted = [...data].sort((a, b) => a - b);
  let centroids = [
    sorted[0],
    sorted[Math.floor(sorted.length / 2)],
    sorted[sorted.length - 1],
  ];

  let assignments = new Array(data.length).fill(0);
  let changed = true;
  let iterations = 0;
  const maxIterations = 100;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (let i = 0; i < data.length; i++) {
      let minDist = Infinity;
      let bestCluster = 0;

      for (let j = 0; j < k; j++) {
        const dist = Math.abs(data[i] - centroids[j]);
        if (dist < minDist) {
          minDist = dist;
          bestCluster = j;
        }
      }

      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    for (let j = 0; j < k; j++) {
      const points = data.filter((_, i) => assignments[i] === j);
      if (points.length > 0) {
        centroids[j] = points.reduce((sum, p) => sum + p, 0) / points.length;
      }
    }
  }

  const result = [];
  for (let j = 0; j < k; j++) {
    const points = data.filter((_, i) => assignments[i] === j);
    if (points.length > 0) {
      result.push({
        centroid: centroids[j],
        count: points.length,
      });
    }
  }

  result.sort((a, b) => a.centroid - b.centroid);
  return result;
}

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.PORT || 3079;
app.listen(PORT, () => {
  console.log(`✅ HR Manager Backend (MySQL) running on port ${PORT}`);
});
