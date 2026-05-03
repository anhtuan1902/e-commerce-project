# Dùng Node.js 22 phiên bản nhẹ (alpine = ~5MB thay vì ~300MB)
FROM node:22-alpine

# Tạo và vào thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json TRƯỚC (quan trọng!)
# Docker cache layer — nếu package.json không đổi
# thì lần build sau bỏ qua bước npm install → nhanh hơn
COPY package*.json ./

# Cài tất cả dependencies (bao gồm devDependencies)
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# Khai báo port backend sẽ chạy
EXPOSE 5000

# Lệnh chạy khi container start
# (bị override bởi docker-compose command: npm run dev)
CMD ["npm", "run", "dev"]