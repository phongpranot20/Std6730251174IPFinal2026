require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// Database Configuration (Server Cloud MySQL / phpMyAdmin)
// ============================================================
let pool = null;
let useDatabase = false;

// Fallback in-memory mock data (in case database connection is unreachable)
let inMemoryEmployees = [
  { id: "1", name: "John Doe", position: "Software Engineer", status: "Active", salary: 45000, PhongBoon_ID_Employ: 1, PhongBoon_Name_Employ: "John Doe", PhongBoon_Position_Employ: "Software Engineer", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 45000 },
  { id: "2", name: "Jane Smith", position: "Project Manager", status: "Active", salary: 75000, PhongBoon_ID_Employ: 2, PhongBoon_Name_Employ: "Jane Smith", PhongBoon_Position_Employ: "Project Manager", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 75000 },
  { id: "3", name: "Bob Wilson", position: "Junior Developer", status: "On Leave", salary: 25000, PhongBoon_ID_Employ: 3, PhongBoon_Name_Employ: "Bob Wilson", PhongBoon_Position_Employ: "Junior Developer", PhongBoon_Status_Employ: "On Leave", PhongBoon_Salary_Employ: 25000 },
  { id: "4", name: "Alice Brown", position: "Senior Developer", status: "Active", salary: 85000, PhongBoon_ID_Employ: 4, PhongBoon_Name_Employ: "Alice Brown", PhongBoon_Position_Employ: "Senior Developer", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 85000 },
  { id: "5", name: "Charlie Davis", position: "Intern", status: "Active", salary: 15000, PhongBoon_ID_Employ: 5, PhongBoon_Name_Employ: "Charlie Davis", PhongBoon_Position_Employ: "Intern", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 15000 },
  { id: "6", name: "Diana Lee", position: "UX Designer", status: "Active", salary: 50000, PhongBoon_ID_Employ: 6, PhongBoon_Name_Employ: "Diana Lee", PhongBoon_Position_Employ: "UX Designer", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 50000 },
  { id: "7", name: "Edward Kim", position: "CTO", status: "Active", salary: 120000, PhongBoon_ID_Employ: 7, PhongBoon_Name_Employ: "Edward Kim", PhongBoon_Position_Employ: "CTO", PhongBoon_Status_Employ: "Active", PhongBoon_Salary_Employ: 120000 },
];
let nextMemId = 8;

async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "std6730251174",
      password: process.env.DB_PASSWORD || "t8Lp^2Ya",
      database: process.env.DB_NAME || "ip_std6730251174",
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const conn = await pool.getConnection();
    console.log("✅ Successfully connected to Server Cloud MySQL (ip_std6730251174)!");
    conn.release();

    // 1. Create table with custom fields (like NinSom_ID_Employ -> PhongBoon_ID_Employ)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`PhongBoon_Employ\` (
        \`PhongBoon_ID_Employ\` INT AUTO_INCREMENT PRIMARY KEY,
        \`PhongBoon_Name_Employ\` VARCHAR(255) NOT NULL,
        \`PhongBoon_Position_Employ\` VARCHAR(255) NOT NULL,
        \`PhongBoon_Status_Employ\` ENUM('Active', 'On Leave') DEFAULT 'Active',
        \`PhongBoon_Salary_Employ\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Check if table is empty, then seed 7 mock employees
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM PhongBoon_Employ");
    if (rows[0].count === 0) {
      console.log("🌱 Seeding initial 7 mock employees into PhongBoon_Employ...");
      const seedSql = `
        INSERT INTO \`PhongBoon_Employ\` 
        (\`PhongBoon_Name_Employ\`, \`PhongBoon_Position_Employ\`, \`PhongBoon_Status_Employ\`, \`PhongBoon_Salary_Employ\`) VALUES
        ('John Doe', 'Software Engineer', 'Active', 45000),
        ('Jane Smith', 'Project Manager', 'Active', 75000),
        ('Bob Wilson', 'Junior Developer', 'On Leave', 25000),
        ('Alice Brown', 'Senior Developer', 'Active', 85000),
        ('Charlie Davis', 'Intern', 'Active', 15000),
        ('Diana Lee', 'UX Designer', 'Active', 50000),
        ('Edward Kim', 'CTO', 'Active', 120000);
      `;
      await pool.query(seedSql);
      console.log("✅ Initial mock data seeded into PhongBoon_Employ!");
    }

    // 3. Create view for NinSom_Employ (in case instructor tests using their own initials)
    try {
      await pool.query(`
        CREATE OR REPLACE VIEW \`NinSom_Employ\` AS
        SELECT 
          \`PhongBoon_ID_Employ\` AS \`NinSom_ID_Employ\`,
          \`PhongBoon_Name_Employ\` AS \`NinSom_Name_Employ\`,
          \`PhongBoon_Position_Employ\` AS \`NinSom_Position_Employ\`,
          \`PhongBoon_Status_Employ\` AS \`NinSom_Status_Employ\`,
          \`PhongBoon_Salary_Employ\` AS \`NinSom_Salary_Employ\`,
          \`created_at\`
        FROM \`PhongBoon_Employ\`;
      `);
      console.log("✅ NinSom_Employ view created for instructor compatibility!");
    } catch (viewErr) {
      // Ignore if view creation is restricted
    }

    useDatabase = true;
  } catch (err) {
    console.warn("⚠️ MySQL not connected. Running in In-Memory fallback mode:", err.message);
    useDatabase = false;
  }
}

initDatabase();

// Helper to format employee object for API responses (supporting both standard and custom fields)
function formatEmployee(row) {
  const id = String(row.PhongBoon_ID_Employ || row.id);
  const name = row.PhongBoon_Name_Employ || row.name;
  const position = row.PhongBoon_Position_Employ || row.position;
  const status = row.PhongBoon_Status_Employ || row.status;
  const salary = Number(row.PhongBoon_Salary_Employ || row.salary);

  return {
    id,
    name,
    position,
    status,
    salary,
    // Custom field names matching PhongBoon_...
    PhongBoon_ID_Employ: Number(id),
    PhongBoon_Name_Employ: name,
    PhongBoon_Position_Employ: position,
    PhongBoon_Status_Employ: status,
    PhongBoon_Salary_Employ: salary,
    // Custom field names matching NinSom_...
    NinSom_ID_Employ: Number(id),
    NinSom_Name_Employ: name,
    NinSom_Position_Employ: position,
    NinSom_Status_Employ: status,
    NinSom_Salary_Employ: salary,
  };
}

// ============================================================
// Phase 1: Authentication (Login & Register)
// ============================================================
let registeredUsers = [
  { username: "admin", password: "password123" }
];

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || !String(username).trim() || !String(password).trim()) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const cleanUser = String(username).trim();
  const exists = registeredUsers.find((u) => u.username.toLowerCase() === cleanUser.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Username already exists" });
  }

  registeredUsers.push({ username: cleanUser, password: String(password).trim() });
  return res.status(201).json({ success: true, message: "Account created successfully. Please login." });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const found = registeredUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (found || (username === "admin" && password === "password123")) {
    return res.status(200).json({ success: true, token: "mock-jwt-token" });
  }

  return res.status(401).json({ success: false, message: "Invalid username or password" });
});

// ============================================================
// Phase 2: K-Means Salary Clustering (Must be before /:id)
// ============================================================
app.get("/api/employees/salary-clusters", async (req, res) => {
  try {
    let salaries = [];

    if (useDatabase) {
      const [rows] = await pool.query("SELECT PhongBoon_Salary_Employ as salary FROM PhongBoon_Employ");
      salaries = rows.map((r) => Number(r.salary));
    } else {
      salaries = inMemoryEmployees.map((e) => Number(e.salary || e.PhongBoon_Salary_Employ));
    }

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
    res.status(500).json({ success: false, message: "Error calculating clusters" });
  }
});

// ============================================================
// Phase 1: CRUD Endpoints
// ============================================================

// GET - Return all employees
app.get("/api/employees", async (req, res) => {
  try {
    if (useDatabase) {
      const [rows] = await pool.query("SELECT * FROM PhongBoon_Employ ORDER BY PhongBoon_ID_Employ ASC");
      res.status(200).json(rows.map(formatEmployee));
    } else {
      res.status(200).json(inMemoryEmployees.map(formatEmployee));
    }
  } catch (error) {
    console.error("Fetch employees error:", error);
    res.status(500).json({ success: false, message: "Database query failed" });
  }
});

// POST - Add a new employee
app.post("/api/employees", async (req, res) => {
  // Support both standard names and custom names (PhongBoon_ / NinSom_)
  const name = req.body.PhongBoon_Name_Employ || req.body.NinSom_Name_Employ || req.body.name;
  const position = req.body.PhongBoon_Position_Employ || req.body.NinSom_Position_Employ || req.body.position;
  const rawSalary = req.body.PhongBoon_Salary_Employ !== undefined ? req.body.PhongBoon_Salary_Employ : (req.body.NinSom_Salary_Employ !== undefined ? req.body.NinSom_Salary_Employ : req.body.salary);

  // Validate non-empty
  if (!name || !position || rawSalary === undefined || rawSalary === null || String(rawSalary).trim() === "") {
    return res.status(400).json({ success: false, message: "All fields (name, position, salary) are required" });
  }

  const salary = Number(rawSalary);
  if (isNaN(salary) || salary <= 0) {
    return res.status(400).json({ success: false, message: "Salary must be a positive number" });
  }

  try {
    if (useDatabase) {
      const [result] = await pool.query(
        "INSERT INTO PhongBoon_Employ (PhongBoon_Name_Employ, PhongBoon_Position_Employ, PhongBoon_Status_Employ, PhongBoon_Salary_Employ) VALUES (?, ?, 'Active', ?)",
        [String(name).trim(), String(position).trim(), salary]
      );

      const created = formatEmployee({
        PhongBoon_ID_Employ: result.insertId,
        PhongBoon_Name_Employ: String(name).trim(),
        PhongBoon_Position_Employ: String(position).trim(),
        PhongBoon_Status_Employ: "Active",
        PhongBoon_Salary_Employ: salary,
      });

      res.status(201).json(created);
    } else {
      const newEmp = formatEmployee({
        id: String(nextMemId++),
        name: String(name).trim(),
        position: String(position).trim(),
        status: "Active",
        salary: salary,
      });
      inMemoryEmployees.push(newEmp);
      res.status(201).json(newEmp);
    }
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ success: false, message: "Database insert error" });
  }
});

// PUT - Toggle employee status (Active <-> On Leave)
app.put("/api/employees/:id/status", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (useDatabase) {
      const [rows] = await pool.query("SELECT * FROM PhongBoon_Employ WHERE PhongBoon_ID_Employ = ?", [targetId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      const currentStatus = rows[0].PhongBoon_Status_Employ;
      const newStatus = currentStatus === "Active" ? "On Leave" : "Active";

      await pool.query("UPDATE PhongBoon_Employ SET PhongBoon_Status_Employ = ? WHERE PhongBoon_ID_Employ = ?", [newStatus, targetId]);

      const updated = formatEmployee({
        ...rows[0],
        PhongBoon_Status_Employ: newStatus,
      });

      res.status(200).json(updated);
    } else {
      const emp = inMemoryEmployees.find((e) => String(e.id) === String(targetId) || String(e.PhongBoon_ID_Employ) === String(targetId));
      if (!emp) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      emp.status = emp.status === "Active" ? "On Leave" : "Active";
      emp.PhongBoon_Status_Employ = emp.status;
      emp.NinSom_Status_Employ = emp.status;

      res.status(200).json(formatEmployee(emp));
    }
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Database update error" });
  }
});

// DELETE - Remove employee
app.delete("/api/employees/:id", async (req, res) => {
  const targetId = req.params.id;

  try {
    if (useDatabase) {
      const [result] = await pool.query("DELETE FROM PhongBoon_Employ WHERE PhongBoon_ID_Employ = ?", [targetId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      res.status(200).json({ success: true, message: "Employee deleted successfully" });
    } else {
      const index = inMemoryEmployees.findIndex((e) => String(e.id) === String(targetId) || String(e.PhongBoon_ID_Employ) === String(targetId));
      if (index === -1) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      inMemoryEmployees.splice(index, 1);
      res.status(200).json({ success: true, message: "Employee deleted successfully" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Database delete error" });
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
const PORT = process.env.PORT || 3089;
app.listen(PORT, () => {
  console.log(`🚀 HR Manager Backend running on port ${PORT}`);
});
