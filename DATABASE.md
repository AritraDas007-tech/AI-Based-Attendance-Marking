# Database Documentation: AI Student Attendance System (MySQL)

The system has been migrated from SQLite to **MySQL** to support advanced management via **MySQL Workbench**.

## 🗄️ Database Technology

- **Type**: **MySQL 8.0 CE**
- **Host**: `localhost` (127.0.0.1)
- **Port**: `3306`
- **Database**: `attendance_system`
- **Username**: `root`
- **Password**: `Aritra99231`
- **ORM**: **SQLAlchemy** via `pymysql` driver.

---

## 🏗️ Table Schema

Manage these tables directly in **MySQL Workbench**:

1. **`teachers`**: Supervisor accounts (Name, Email, BCrypt Hashed Passwords).
2. **`students`**: Student profiles (Roll No, Name, Email, Dept, Class).
3. **`face_encodings`**: 128-dimensional AI vectors for face recognition.
4. **`attendance`**: Daily check-in logs with timestamps and status.

---

## 🛠️ Management via MySQL Workbench

You can now use MySQL Workbench to:
- **Visualize Data**: Right-click on any table and select "Select Rows - Limit 1000".
- **Run Queries**: Use the SQL Editor to perform custom searches (e.g., `SELECT * FROM attendance WHERE date = '2026-03-20';`).
- **Backup/Export**: Use the Data Export tool to save backups of your attendance records.

---

## 🚀 Re-initialization
The backend is configured to auto-create tables on startup. If you delete the `attendance_system` database and recreate an empty one, restarting the FastAPI server will automatically rebuild the schema.
