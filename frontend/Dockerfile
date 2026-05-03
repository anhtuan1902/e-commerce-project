FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host: cho phép truy cập từ ngoài container
# Mặc định Vite chỉ lắng nghe localhost bên trong container
# Thêm --host để máy thật có thể truy cập qua localhost:5173
CMD ["npm", "run", "dev", "--", "--host"]