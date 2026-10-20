const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// Mock Data - In-memory array (at least 5 employees)
// ============================================================
let employees = [
  { id: "1", name: "John Doe", position: "Software Engineer", status: "Active", salary: 45000 },
  { id: "2", name: "Jane Smith", position: "Project Manager", status: "Active", salary: 75000 },
  { id: "3", name: "Bob Wilson", position: "Junior Developer", status: "On Leave", salary: 25000 },
  { id: "4", name: "Alice Brown", position: "Senior Developer", status: "Active", salary: 85000 },
  { id: "5", name: "Charlie Davis", position: "Intern", status: "Active", salary: 15000 },
  { id: "6", name: "Diana Lee", position: "UX Designer", status: "Active", salary: 50000 },
  { id: "7", name: "Edward Kim", position: "CTO", status: "Active", salary: 120000 },
];

let nextId = 8;

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
// Phase 2: K-Means Salary Clustering
// ** IMPORTANT: This route MUST be before /:id routes **
// ============================================================
app.get("/api/employees/salary-clusters", (req, res) => {
  const salaries = employees.map((e) => e.salary);

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
});

// ============================================================
// Phase 1: CRUD Endpoints
// ============================================================

// GET - Return all employees
app.get("/api/employees", (req, res) => {
  res.status(200).json(employees);
});

// POST - Add a new employee
app.post("/api/employees", (req, res) => {
  const { name, position, salary } = req.body;

  if (!name || !position || salary === undefined || salary === null || salary === "") {
    return res.status(400).json({ success: false, message: "All fields (name, position, salary) are required" });
  }

  const newEmployee = {
    id: String(nextId++),
    name,
    position,
    status: "Active",
    salary: Number(salary),
  };

  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

// PUT - Toggle employee status (Active <-> On Leave)
app.put("/api/employees/:id/status", (req, res) => {
  const employee = employees.find((e) => e.id === req.params.id);

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  employee.status = employee.status === "Active" ? "On Leave" : "Active";
  res.status(200).json(employee);
});

// DELETE - Remove employee
app.delete("/api/employees/:id", (req, res) => {
  const index = employees.findIndex((e) => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  employees.splice(index, 1);
  res.status(200).json({ success: true, message: "Employee deleted" });
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
// Start Server (Port 3079)
// ============================================================
const PORT = process.env.PORT || 3079;
app.listen(PORT, () => {
  console.log(`✅ HR Manager Backend (In-Memory) running on port ${PORT}`);
});
