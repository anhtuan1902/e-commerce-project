const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});
