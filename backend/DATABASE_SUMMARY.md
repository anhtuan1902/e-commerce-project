# Backend Database Summary

## Tổng quan

Backend sử dụng Sequelize ORM kết nối với cơ sở dữ liệu quan hệ (MySQL/PostgreSQL tùy cấu hình). Các model nằm trong `backend/src/models` và mang tên bảng tương ứng với `tableName` trong mỗi định nghĩa.

- Mọi bảng chính đều có `timestamps: true` (bao gồm `createdAt`, `updatedAt`).
- Nhiều bảng dùng `paranoid: true` để hỗ trợ soft delete.
- Danh sách migration nằm trong `backend/database/migrations`.

## Các bảng chính và vai trò

### 1. `users`

- Chứa tài khoản người dùng.
- Fields quan trọng: `email`, `password`, `role`, `googleId`, `isVerified`, `isActive`, `refreshToken`, `lastLoginAt`.
- Roles: `admin`, `vendor`, `customer`.
- Quan hệ:
  - `hasOne(user_profiles)`
  - `hasMany(addresses)`
  - `hasOne(loyalty_wallets)`
  - `hasMany(loyalty_transactions)`
  - `hasOne(vendors)`
  - `hasMany(orders)`
  - `hasMany(ratings)`
  - `hasMany(comments)`
  - `hasMany(wishlists)`
  - `hasMany(bookings)`
  - `hasMany(messages)`
  - `hasMany(conversations)`

### 2. `user_profiles`

- Mở rộng thông tin người dùng.
- Fields: `user_id`, `name`, `avatar`, `phone`, `birthday`, `gender`.
- `user_id` là khóa ngoại duy nhất với `users`.

### 3. `addresses`

- Lưu địa chỉ giao hàng / hóa đơn của người dùng.
- Fields: `user_id`, `type` (`home` / `work`), `name`, `phone`, `address_detail`, `ward`, `city`, `is_default`.
- Quan hệ:
  - `belongsTo(users)`
  - `hasMany(orders)` với `shipping_address_id` và `billing_address_id`.

### 4. `vendors`

- Thông tin shop / nhà cung cấp.
- Fields: `user_id`, `store_name`, `description`, `logo_url`, `banner_url`, `contact_email`, `contact_phone`, `address`, `business_type`, `status`, `commission_rate`.
- Quan hệ:
  - `belongsTo(users)`
  - `hasMany(products)`
  - `hasMany(promotions)`
  - `hasMany(order_vendors)`
  - `hasMany(bookings)`
  - `hasMany(ratings)`

### 5. `categories`

- Nhóm sản phẩm.
- Có category cha / con (`parent_id`).
- Quan hệ:
  - `belongsTo(categories)`
  - `hasMany(categories)`
  - `hasMany(products)`

### 6. `products`

- Sản phẩm thuộc vendor và category.
- Fields chính: `vendor_id`, `category_id`, `name`, `slug`, `description`, `sku`, `price`, `compare_price`, `cost_price`, `weight`, `dimensions`, `tags`, `attributes`, `status`, `visibility`, `stock_status`, `allow_backorders`, `featured`, `seo_title`, `seo_description`.
- Quan hệ:
  - `belongsTo(vendors)`
  - `belongsTo(categories)`
  - `hasMany(product_images)`
  - `hasOne(inventories)`
  - `hasMany(order_items)`
  - `hasMany(ratings)`
  - `hasMany(comments)`
  - `hasMany(wishlists)`
  - `hasMany(promotion_products)`

### 7. `product_images`

- Ảnh sản phẩm.
- Fields: `product_id`, `url`, `is_primary`, `sort_order`.
- Quan hệ: `belongsTo(products)`.

### 8. `inventories`

- Quản lý tồn kho sản phẩm.
- Fields: `product_id`, `quantity`, `track_inventory`, `low_stock_threshold`, `stock_status`.
- Quan hệ: `belongsTo(products)`.

### 9. `promotions`

- Chương trình khuyến mãi của vendor.
- Fields: `vendor_id`, `name`, `type`, `discount_value`, `minimum_order_value`, `maximum_discount`, `usage_limit`, `usage_count`, `user_limit`, `start_date`, `end_date`, `is_active`, `coupon_code`, `conditions`.
- Quan hệ:
  - `belongsTo(vendors)`
  - `belongsToMany(products)` qua `promotion_products`

### 10. `promotion_products`

- Bảng nối giữa `promotions` và `products`.
- Fields: `promotion_id`, `product_id`.
- Quan hệ:
  - `belongsTo(promotions)`
  - `belongsTo(products)`

### 11. `orders`

- Đơn hàng của khách.
- Fields: `order_number`, `user_id`, `status`, `payment_status`, `shipping_status`, `subtotal`, `tax_amount`, `shipping_amount`, `discount_amount`, `total_amount`, `currency`, `shipping_address_id`, `billing_address_id`, `notes`, `customer_notes`, `ordered_at`, `shipped_at`, `delivered_at`.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(addresses)` (shipping và billing)
  - `hasMany(order_vendors)`
  - `hasMany(order_items)`
  - `hasMany(payments)`

### 12. `order_vendors`

- Mô tả đơn hàng theo từng vendor.
- Fields: `order_id`, `vendor_id`, `vendor_total`, `vendor_status`, `vendor_shipping_status`, `vendor_notes`.
- Quan hệ:
  - `belongsTo(orders)`
  - `belongsTo(vendors)`
  - `hasMany(order_items)`

### 13. `order_items`

- Sản phẩm trong đơn hàng.
- Fields: `order_id`, `order_vendor_id`, `product_id`, `quantity`, `price`, `tax_amount`, `discount_amount`, `total_amount`.
- Quan hệ:
  - `belongsTo(orders)`
  - `belongsTo(order_vendors)`
  - `belongsTo(products)`

### 14. `payments`

- Thanh toán trong đơn hàng.
- Fields: `order_id`, `amount`, `method`, `status`, `transaction_id`, `payment_date`, `provider_response`.
- Quan hệ: `belongsTo(orders)`.

### 15. `ratings`

- Đánh giá sản phẩm.
- Fields: `user_id`, `product_id`, `order_id`, `rating`, `title`, `comment`, `is_verified_purchase`.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(products)`
  - `belongsTo(orders)`
  - `hasMany(comments)`

### 16. `comments`

- Bình luận/feedback cho sản phẩm.
- Fields: `user_id`, `product_id`, `rating_id`, `parent_id`, `content`, `status`.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(products)`
  - `belongsTo(ratings)`
  - `belongsTo(comments)` (parent)
  - `hasMany(comments)` (replies)

### 17. `wishlists`

- Danh sách yêu thích sản phẩm của user.
- Fields: `user_id`, `product_id`.
- Unique constraint: mỗi user chỉ lưu mỗi product một lần.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(products)`

### 18. `bookings`

- Lịch hẹn dịch vụ với vendor.
- Fields: `user_id`, `vendor_id`, `service_type`, `title`, `description`, `scheduled_date`, `duration_minutes`, `status`, `notes`, `price`, `currency`.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(vendors)`

### 19. `conversations`

- Hộp thoại chat / hỗ trợ.
- Fields: `user_id`, `title`, `type`, `reference_type`, `reference_id`, `status`, `last_message_at`.
- Quan hệ:
  - `belongsTo(users)`
  - `hasMany(messages)`

### 20. `messages`

- Tin nhắn trong cuộc trò chuyện.
- Fields: `conversation_id`, `sender_id`, `content`, `message_type`, `attachment_url`, `is_read`, `read_at`.
- Quan hệ:
  - `belongsTo(conversations)`
  - `belongsTo(users)`

### 21. `loyalty_wallets`

- Ví điểm / điểm thưởng của user.
- Fields: `user_id`, `balance`, `total_earned`, `total_spent`, `status`.
- Quan hệ:
  - `belongsTo(users)`
  - `hasMany(loyalty_transactions)`

### 22. `loyalty_transactions`

- Ghi nhận giao dịch điểm.
- Fields: `user_id`, `wallet_id`, `type`, `amount`, `balance_before`, `balance_after`, `description`, `reference_type`, `reference_id`.
- Quan hệ:
  - `belongsTo(users)`
  - `belongsTo(loyalty_wallets)`

## Ghi chú quan trọng

- Hầu hết bảng dùng `foreignKey` rõ ràng để đảm bảo referential integrity trong Sequelize.
- Các bảng như `users`, `vendors`, `orders`, `products`, `promotions`, `bookings` đều có các enum trạng thái để quản lý luồng nghiệp vụ.
- `wishlist` và `promotion_products` là các bảng quan hệ nhiều-nhiều / dữ liệu liên kết.
- `order_vendors` cho phép tách đơn hàng theo từng vendor, phù hợp với marketplace.

## Hướng đọc nhanh

- Muốn biết dữ liệu người dùng: xem `users`, `user_profiles`, `addresses`, `wishlists`, `loyalty_wallets`.
- Muốn biết dữ liệu shop/sản phẩm: xem `vendors`, `products`, `categories`, `inventories`, `product_images`, `promotions`, `promotion_products`.
- Muốn biết luồng đơn hàng: xem `orders`, `order_vendors`, `order_items`, `payments`.
- Muốn biết phản hồi và hỗ trợ: xem `ratings`, `comments`, `bookings`, `conversations`, `messages`.

## Đường dẫn chính

- Models: `backend/src/models`
- Migrations: `backend/database/migrations`
- Database config: `backend/src/config/database.config.js`
- Sequelize khởi tạo: `backend/src/database/sequelize.js`
