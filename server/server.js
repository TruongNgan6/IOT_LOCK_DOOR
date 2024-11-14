const express = require("express");
const mysql = require("mysql2");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const app = express();
const PORT = 3000;
require("dotenv").config();

app.use(express.json());
const cors = require("cors");
app.use(cors());

// Database connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối MySQL: " + err.message);
    return;
  }
  console.log("Kết nối MySQL thành công!");
});

// Variable to store latest IdCard received from Arduino
let latestIdCard = null;

// Check and find the COM12 port
SerialPort.list()
  .then((ports) => {
    const portExists = ports.some((p) => p.path === "COM12");

    if (portExists) {
      console.log("Cổng COM12 được tìm thấy, bắt đầu kết nối với Arduino...");

      // Initialize connection with Arduino on COM12
      const port = new SerialPort({ path: "COM12", baudRate: 9600 });
      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

      port.on("open", () => {
        console.log("Kết nối với Arduino thành công!");
      });

      // Handle data received from Arduino
      parser.on("data", (data) => {
        console.log("Dữ liệu nhận được từ Arduino:", data);

        // Remove 'UID: ' if present
        const IdCard = data.replace("UID: ", "").trim();
        latestIdCard = IdCard;

        // Check if the IdCard exists in userData table
        connection.query(
          "SELECT * FROM userData WHERE IdCard = ?",
          [latestIdCard],
          (err, result) => {
            if (err) {
              console.error(
                "Database error while checking IdCard:",
                err.message
              );
              return;
            }

            // If IdCard exists, log the attendance
            if (result.length > 0) {
              const timestamp = new Date();

              // Retrieve the latest attendance record for the IdCard
              connection.query(
                "SELECT * FROM attendanceData WHERE IdCard = ? ORDER BY timeStamp DESC LIMIT 1",
                [latestIdCard],
                (err, records) => {
                  if (err) {
                    console.error(
                      "Database error while retrieving attendance record:",
                      err.message
                    );
                    return;
                  }

                  let status;
                  // Determine status based on the latest record
                  if (records.length === 0 || records[0].status === 1) {
                    status = 0; // Check-in
                  } else {
                    status = 1; // Check-out
                  }

                  const attendanceRecord = {
                    IdCard: latestIdCard,
                    timeStamp: timestamp,
                    status: status,
                  };

                  // Insert the new attendance record
                  connection.query(
                    "INSERT INTO attendanceData SET ?",
                    attendanceRecord,
                    (err) => {
                      if (err) {
                        console.error(
                          "Database error while logging attendance:",
                          err.message
                        );
                      } else {
                        console.log(
                          `Attendance ${
                            status === 0 ? "check-in" : "check-out"
                          } logged successfully:`,
                          attendanceRecord
                        );
                      }
                    }
                  );
                }
              );
            } else {
              console.log(
                "IdCard không tồn tại trong cơ sở dữ liệu, không thể ghi lịch sử"
              );
            }
          }
        );
      });

      port.on("error", (err) => {
        console.error("Lỗi kết nối serial:", err.message);
      });
    } else {
      console.error(
        "Cổng COM12 không được tìm thấy. Vui lòng kiểm tra kết nối Arduino."
      );
    }
  })
  .catch((err) => {
    console.error("Lỗi khi liệt kê các cổng serial:", err.message);
  });

// POST API to add new user
app.post("/api/add-user", (req, res) => {
  const { role, fullName, noPhone, password } = req.body;

  console.log("Received data from client:", req.body);

  // Check if IdCard has been received from Arduino
  if (!latestIdCard) {
    return res.status(400).json({
      success: false,
      message: "IdCard chưa được nhận từ Arduino",
    });
  }

  // Check if the IdCard already exists in the database
  connection.query(
    "SELECT * FROM userData WHERE IdCard = ?",
    [latestIdCard],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Lỗi khi kiểm tra IdCard trong cơ sở dữ liệu",
          error: err.message,
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "IdCard đã tồn tại trong cơ sở dữ liệu, không thể thêm người dùng mới",
          user: result[0],
        });
      }

      const newUser = {
        role,
        fullName,
        noPhone,
        password,
        IdCard: latestIdCard,
      };

      connection.query("INSERT INTO userData SET ?", newUser, (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Lỗi khi thêm người dùng",
            error: err.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "Người dùng đã được thêm thành công!",
          user: newUser,
        });
      });
    }
  );
});

// GET API to add infor to card
app.get("/api/get-user", (req, res) => {
  if (!latestIdCard) {
    return res.status(400).json({
      success: false,
      message: "Chưa nhận được IdCard từ Arduino",
    });
  }

  // Truy vấn dữ liệu người dùng từ cơ sở dữ liệu dựa trên IdCard
  connection.query(
    "SELECT IdCard, fullName, noPhone FROM userData WHERE IdCard = ?",
    [latestIdCard],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Lỗi truy vấn cơ sở dữ liệu",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      // Trả về dữ liệu với các thuộc tính mong muốn
      res.status(200).json({
        success: true,
        data: {
          IdCard: result[0].IdCard,
          fullName: result[0].fullName,
          noPhone: result[0].noPhone,
        },
      });
    }
  );
});

app.get("/api/get-user-from-admin", (req, res) => {
  const { IdCard } = req.query; // Lấy IdCard từ query parameter
  console.log("data", IdCard);
  if (!IdCard) {
    return res.status(400).json({
      success: false,
      message: "Missing IdCard parameter",
    });
  }

  // Truy vấn dữ liệu người dùng từ cơ sở dữ liệu dựa trên IdCard
  connection.query(
    "SELECT IdCard, fullName, noPhone FROM userData WHERE IdCard = ?",
    [IdCard],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Lỗi truy vấn cơ sở dữ liệu",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng",
        });
      }

      // Trả về dữ liệu với các thuộc tính mong muốn
      res.status(200).json({
        success: true,
        data: {
          IdCard: result[0].IdCard,
          fullName: result[0].fullName,
          noPhone: result[0].noPhone,
        },
      });
    }
  );
});

app.put("/api/update-user", (req, res) => {
  const { IdCard, fullName, noPhone } = req.body;

  // Kiểm tra nếu thiếu trường thông tin
  if (!IdCard || !fullName || !noPhone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields", // Nếu thiếu trường
    });
  }

  // Cập nhật thông tin fullName và noPhone cho người dùng có IdCard tương ứng
  connection.query(
    "UPDATE userData SET fullName = ?, noPhone = ? WHERE IdCard = ?",
    [fullName, noPhone, IdCard],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database update error", // Nếu có lỗi trong quá trình truy vấn
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found", // Nếu không tìm thấy người dùng với IdCard này
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully", // Trả về thông báo thành công
      });
    }
  );
});

// GET API to retrieve attendance data
app.get("/api/attendance", (req, res) => {
  connection.query("SELECT * FROM attendanceData", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
    }
    res.status(200).json({
      success: true,
      data: results,
    });
  });
});

const sendUIDToArduino = (uid) => {
  if (port.isOpen) {
    // Gửi UID sang Arduino với định dạng "UID:xxxx"
    port.write(`UID:${uid}\n`, (err) => {
      if (err) {
        console.error("Error sending UID to Arduino:", err.message);
      } else {
        console.log("UID sent to Arduino:", uid);
      }
    });
  } else {
    console.error("Serial port not open, cannot send UID.");
  }
};

app.delete("/api/delete-user", (req, res) => {
  const { IdCard } = req.body; // Nhận IdCard từ request body
  console.log("Attempting to delete user with IdCard:", IdCard);

  // Kiểm tra nếu thiếu IdCard
  if (!IdCard) {
    return res.status(400).json({
      success: false,
      message: "IdCard is required", // Nếu thiếu IdCard
    });
  }

  // Sử dụng transaction để đảm bảo cả 2 thao tác xóa thành công hoặc đều thất bại
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Transaction start error",
        error: err.message,
      });
    }

    // Thực hiện xóa người dùng có IdCard tương ứng
    connection.query(
      "DELETE FROM userData WHERE IdCard = ?",
      [IdCard],
      (err, result) => {
        if (err) {
          return connection.rollback(() => {
            return res.status(500).json({
              success: false,
              message: "Database delete error in userData",
              error: err.message,
            });
          });
        }

        if (result.affectedRows === 0) {
          return connection.rollback(() => {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          });
        }

        // Xóa thông tin trong bảng attendanceData
        connection.query(
          "DELETE FROM attendanceData WHERE IdCard = ?",
          [IdCard],
          (err, result) => {
            if (err) {
              return connection.rollback(() => {
                return res.status(500).json({
                  success: false,
                  message: "Database delete error in attendanceData",
                  error: err.message,
                });
              });
            }

            // Nếu có lỗi trong quá trình xóa, thực hiện rollback
            if (result.affectedRows === 0) {
              console.log("No records found to delete in attendanceData");
            } else {
              console.log(
                `${result.affectedRows} records deleted from attendanceData`
              );
            }

            // Nếu không có lỗi, commit transaction
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  return res.status(500).json({
                    success: false,
                    message: "Transaction commit error",
                    error: err.message,
                  });
                });
              }

              // Trả về thông báo thành công
              res.status(200).json({
                success: true,
                message:
                  "User and related attendance data deleted successfully",
              });
            });
          }
        );
      }
    );
  });
});

// Trigger this function when UID needs to be updated
app.post("/api/update-uid", (req, res) => {
  const { uid } = req.body; // Assume UID comes from request body or database

  if (uid) {
    sendUIDToArduino(uid); // Send UID to Arduino
    res.status(200).json({ message: "UID sent to Arduino" });
  } else {
    res.status(400).json({ error: "Invalid UID" });
  }
});

// Delete Event

// Edit Event

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
