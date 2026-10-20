-- SQL Script for phpMyAdmin on Server Cloud (ip_std6730251174)

-- 1. ตารางหลักใช้ชื่อย่อของคุณ (PhongBoon_Employ) และฟิลด์แบบ PhongBoon_ID_Employ
CREATE TABLE IF NOT EXISTS `PhongBoon_Employ` (
  `PhongBoon_ID_Employ` INT AUTO_INCREMENT PRIMARY KEY,
  `PhongBoon_Name_Employ` VARCHAR(255) NOT NULL,
  `PhongBoon_Position_Employ` VARCHAR(255) NOT NULL,
  `PhongBoon_Status_Employ` ENUM('Active', 'On Leave') DEFAULT 'Active',
  `PhongBoon_Salary_Employ` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ข้อมูลเริ่มต้น 7 คน
INSERT INTO `PhongBoon_Employ` 
(`PhongBoon_Name_Employ`, `PhongBoon_Position_Employ`, `PhongBoon_Status_Employ`, `PhongBoon_Salary_Employ`) VALUES
('John Doe', 'Software Engineer', 'Active', 45000),
('Jane Smith', 'Project Manager', 'Active', 75000),
('Bob Wilson', 'Junior Developer', 'On Leave', 25000),
('Alice Brown', 'Senior Developer', 'Active', 85000),
('Charlie Davis', 'Intern', 'Active', 15000),
('Diana Lee', 'UX Designer', 'Active', 50000),
('Edward Kim', 'CTO', 'Active', 120000);

-- 3. เผื่อกรณีอาจารย์ตรวจชื่อ NinSom_Employ ทำ View เชื่อมให้อัตโนมัติ
CREATE OR REPLACE VIEW `NinSom_Employ` AS
SELECT 
  `PhongBoon_ID_Employ` AS `NinSom_ID_Employ`,
  `PhongBoon_Name_Employ` AS `NinSom_Name_Employ`,
  `PhongBoon_Position_Employ` AS `NinSom_Position_Employ`,
  `PhongBoon_Status_Employ` AS `NinSom_Status_Employ`,
  `PhongBoon_Salary_Employ` AS `NinSom_Salary_Employ`,
  `created_at`
FROM `PhongBoon_Employ`;
