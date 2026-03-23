const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  // eslint-disable-next-line no-console
  console.log('🔌 Đang tắt server...');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('🔌 Server đã tắt.');
    process.exit(0);
  });
});
