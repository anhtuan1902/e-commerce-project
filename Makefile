# make dev → khởi động môi trường dev
dev:
	docker compose build --no-cache
	docker compose up -d
	@echo "Frontend:   http://localhost:5173"
	@echo "Backend:    http://localhost:5000"

# make stop → dừng tất cả
stop:
	docker compose down

# make logs → xem log realtime
logs:
	docker compose logs -f

# make migrate → chạy migration
migrate:
	docker exec marketplace_backend npx sequelize-cli db:migrate

# make seed → thêm data mẫu
seed:
	docker exec marketplace_backend npx sequelize-cli db:seed:all

# make prod-up → chạy production
prod-up:
	docker compose -f docker-compose.prod.yml up -d

# make clean → xóa sạch (cẩn thận: mất data!)
clean:
	docker compose down -v
	docker image prune -f

# DEV hàng ngày:
#   make dev → docker-compose up
#   Sửa code → tự hot reload
#   make migrate → tạo bảng mới

# PUSH CODE:
#   git push origin main
#        ↓
#   GitHub Actions chạy tự động:
#   Test Backend → Test Frontend
#        ↓ (pass hết)
#   Build Docker image
#   Push lên Docker Hub
#        ↓
#   SSH vào VPS
#   Pull image mới
#   Restart containers
#   Chạy migration
#        ↓
#   ✅ Production cập nhật xong!