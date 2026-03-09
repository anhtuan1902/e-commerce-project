const app = require("./app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối MySQL thành công!");

    await sequelize.sync({ alter: true }); // Tự tạo bảng theo models
    console.log("✅ Database đã sync!");

    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối:", error);
  }
}

startServer();
