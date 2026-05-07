require('dotenv').config();
const { faker } = require('@faker-js/faker');
const { connectDB, sequelize, Category, Product, Vendor, User } = require('./src/database');
const { v4: uuidv4 } = require('uuid');

// Override DB host for local development (outside Docker)
if (process.env.DB_HOST === 'marketplace_mysql') {
  process.env.DB_HOST = '127.0.0.1'; // Force TCP connection
}

// Config
const NUM_CATEGORIES = 30;
const NUM_PRODUCTS = 1050;
const NUM_VENDORS = 50;

// Vietnamese-friendly category data
const CATEGORY_TEMPLATES = [
  {
    name: 'Điện thoại & Tablet',
    products: [
      'iPhone',
      'Samsung Galaxy',
      'Xiaomi',
      'OPPO',
      'Vivo',
      'Nokia',
      'Realme',
      'iPad',
      'Huawei',
    ],
  },
  {
    name: 'Laptop & Máy tính',
    products: [
      'Dell XPS',
      'MacBook Pro',
      'HP Pavilion',
      'Lenovo ThinkPad',
      'ASUS ROG',
      'Acer Aspire',
      'Microsoft Surface',
      'MSI Gaming',
    ],
  },
  {
    name: 'Thời trang nam',
    products: [
      'Áo sơ mi',
      'Quần jeans',
      'Áo polo',
      'Jackets',
      'Quần shorts',
      'Vest',
      'Áo thun',
      'Kaki',
    ],
  },
  {
    name: 'Thời trang nữ',
    products: ['Váy', 'Áo blouse', 'Quần', 'Đầm', 'Jackets', 'Áo kiểu', 'Chân váy', 'Jumpsuit'],
  },
  {
    name: 'Giày dép nam',
    products: [
      'Giày thể thao',
      'Giày da',
      'Sandal',
      'Boot',
      'Giày lười',
      'Giày Oxford',
      'Giày causal',
    ],
  },
  {
    name: 'Giày dép nữ',
    products: [
      'Giày cao gót',
      'Giày búp bê',
      'Giày thể thao',
      'Sandal',
      'Boot',
      'Guốc',
      'Giày mules',
    ],
  },
  {
    name: 'Đồng hồ & Trang sức',
    products: [
      'Đồng hồ automatic',
      'Đồng hồ thông minh',
      'Vòng tay',
      'Dây chuyền',
      'Nhẫn',
      'Bông tai',
      'Lắc tay',
    ],
  },
  {
    name: 'Thiết bị điện tử',
    products: [
      'Tai nghe',
      'Loa bluetooth',
      'Sạc dự phòng',
      'Cáp sạc',
      'Chuột không dây',
      'Bàn phím',
      'Webcam',
      'Micro',
    ],
  },
  {
    name: 'Thiết bị gia đình',
    products: [
      'Nồi cơm điện',
      'Máy lọc nước',
      'Quạt',
      'Đèn LED',
      'Máy xay sinh tố',
      'Bếp từ',
      'Lò vi sóng',
    ],
  },
  {
    name: 'Thiết bị văn phòng',
    products: [
      'Máy in',
      'Máy scan',
      'Máy chiếu',
      'Ghế văn phòng',
      'Bàn làm việc',
      'Kệ sách',
      'Tủ hồ sơ',
    ],
  },
  {
    name: 'Thể thao & Dã ngoại',
    products: ['Bóng đá', 'Bóng rổ', 'Cầu lông', 'Bơi lội', 'Yoga', 'Camping', 'Leo núi', 'Xe đạp'],
  },
  {
    name: 'Sức khỏe & Làm đẹp',
    products: ['Kem dưỡng', 'Sữa rửa mặt', 'Son môi', 'Phấn nền', 'Nước hoa', 'Dầu gội', 'Sữa tắm'],
  },
  {
    name: 'Sách & Văn phòng phẩm',
    products: [
      'Sách văn học',
      'Sách kỹ năng',
      'Sách thiếu nhi',
      'Vở',
      'Bút',
      'Giấy A4',
      'Máy tính',
    ],
  },
  {
    name: 'Đồ chơi & Game',
    products: [
      'Lego',
      'Gấu bông',
      'Robot',
      'Xe điều khiển',
      'Game console',
      'Tay cầm',
      'VR headset',
    ],
  },
  {
    name: 'Ô tô & Xe máy',
    products: ['Mũ bảo hiểm', 'Găng tay', 'Bạt che', 'Dầu nhớt', 'Lốp xe', 'Phụ kiện nội thất'],
  },
  {
    name: 'Thức ăn & Đồ uống',
    products: ['Cà phê', 'Trà', 'Bánh', 'Snack', 'Nước giải khát', 'Mì ăn liền', 'Gia vị'],
  },
  {
    name: 'Chăm sóc thú cưng',
    products: ['Thức ăn cho mèo', 'Thức ăn cho chó', 'Đồ chơi', 'Giường', 'Vòng cổ', 'Thuốc men'],
  },
  {
    name: 'Trang trí nhà cửa',
    products: ['Tranh', 'Đồng hồ treo tường', 'Gương', 'Thảm', 'Rèm', 'Gối', 'Nến thơm'],
  },
  {
    name: 'Dụng cụ làm bếp',
    products: ['Dao', 'Chảo', 'Nồi', 'Dụng cụ nấu ăn', 'Hộp đựng', 'Khay', 'Muỗng đũa'],
  },
  {
    name: 'Máy ảnh & Quay phim',
    products: ['Canon EOS', 'Sony Alpha', 'Nikon', 'Fujifilm', 'Tripod', 'Đèn flash', 'Túi đựng'],
  },
  {
    name: 'Điện gia dụng',
    products: ['Máy lạnh', 'Máy giặt', 'Tủ lạnh', 'Tivi', 'Quạt điều hòa', 'Máy hút bụi'],
  },
  {
    name: 'Thiết bị y tế',
    products: ['Nhiệt kế', 'Máy đo huyết áp', 'Máy xông', 'Khẩu trang', 'Nước rửa tay', 'Băng keo'],
  },
  {
    name: 'Du lịch & Vali',
    products: ['Vali kéo', 'Túi du lịch', 'Túi đeo chéo', 'Balo', 'Ví passport', 'Gối cổ'],
  },
  {
    name: 'Nhạc cụ',
    products: ['Đàn guitar', 'Đàn piano', 'Trống', 'Violin', 'Sáo', 'Micro', 'Amplifier'],
  },
  {
    name: 'Hàng tiêu dùng',
    products: ['Xà phòng', 'Kem đánh răng', 'Dầu gội', 'Sữa tắm', 'Giấy ăn', 'Nước rửa chén'],
  },
  {
    name: 'Phụ kiện công nghệ',
    products: ['Ốp lưng', 'Film bảo vệ', 'Dock sạc', 'Giá đỡ', 'Balo laptop', 'Túi chống sốc'],
  },
  {
    name: 'Điện lạnh',
    products: ['Điều hòa', 'Tủ đông', 'Máy làm kem', 'Máy xay đá', 'Máy sấy quần áo'],
  },
  {
    name: 'Cây cảnh & Hoa',
    products: ['Cây xanh', 'Hoa tươi', 'Chậu hoa', 'Đất trồng', 'Phân bón', 'Dụng cụ tưới'],
  },
  {
    name: 'Thiết bị âm thanh',
    products: ['Loa karaoke', 'Micro không dây', 'Ampli', 'Mixer', 'Cáp âm thanh', 'Tai nghe DJ'],
  },
  {
    name: 'Hàng xách tay',
    products: ['Mỹ phẩm', 'Son', 'Nước hoa', 'Kem dưỡng', 'Thực phẩm chức năng', 'Thuốc bổ'],
  },
];

const VISIBILITIES = ['public', 'private', 'hidden'];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function generateSKU(categoryIndex, productIndex) {
  return `SKU-${String(categoryIndex).padStart(3, '0')}-${String(productIndex).padStart(5, '0')}`;
}

async function seedCategories() {
  console.log(`\n🌱 Creating ${NUM_CATEGORIES} categories...`);
  const categories = [];

  for (let i = 0; i < NUM_CATEGORIES; i++) {
    const template = CATEGORY_TEMPLATES[i % CATEGORY_TEMPLATES.length];
    const variant =
      i >= CATEGORY_TEMPLATES.length ? `-${Math.floor(i / CATEGORY_TEMPLATES.length) + 1}` : '';

    const name = `${template.name}${variant}`;
    const slug = generateSlug(name) + '-' + uuidv4().slice(0, 8);

    const category = await Category.create({
      name,
      slug,
      description: faker.lorem.sentences({ min: 2, max: 5 }),
      image: `https://picsum.photos/seed/${slug}/800/600`,
      is_active: faker.datatype.boolean({ probability: 0.9 }),
    });
    categories.push(category);

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/${NUM_CATEGORIES} categories`);
    }
  }

  console.log(`✅ Created ${categories.length} categories`);
  return categories;
}

async function seedVendors() {
  console.log(`\n🏪 Creating ${NUM_VENDORS} vendors...`);
  const vendors = [];

  // Check existing users
  let users = await User.findAll({ limit: NUM_VENDORS });

  // Create vendor users if not enough exist
  if (users.length < NUM_VENDORS) {
    console.log(`  Creating ${NUM_VENDORS - users.length} vendor users...`);
    const usersToCreate = NUM_VENDORS - users.length;
    const vendorUsers = [];

    for (let i = 0; i < usersToCreate; i++) {
      const user = await User.create({
        email: faker.internet.email().toLowerCase(),
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // placeholder hashed password
        role: 'vendor',
        isVerified: true,
        isActive: true,
      });
      vendorUsers.push(user);
    }

    users = [...users, ...vendorUsers];
  }

  // Create vendors linked to users
  for (let i = 0; i < NUM_VENDORS; i++) {
    const userId = users[i].id;
    const storeName =
      faker.helpers.arrayElement([
        'TechZone',
        'SmartStore',
        'GadgetPro',
        'DigitalHub',
        'ElectroWorld',
        'FashionVilla',
        'StyleHub',
        'TrendyWear',
        'GucciStyle',
        'LuxeFashion',
        'HomeDecor',
        'CozyLiving',
        'FurniturePlus',
        'HomeStyle',
        'InteriorPro',
        'FoodMart',
        'FreshMarket',
        'OrganicShop',
        'GourmetFood',
        'DeliFresh',
      ]) +
      ' ' +
      faker.string.alphanumeric(4).toUpperCase();

    const vendor = await Vendor.create({
      user_id: userId,
      store_name: storeName,
      description: faker.lorem.sentences({ min: 2, max: 4 }),
      logo_url: `https://picsum.photos/seed/vendor-${i}/200/200`,
      banner_url: `https://picsum.photos/seed/banner-${i}/1200/400`,
      contact_email: faker.internet.email().toLowerCase(),
      contact_phone: faker.phone.number({ style: 'national' }),
      address: faker.location.streetAddress(true),
      business_type: faker.helpers.arrayElement(['individual', 'business', 'enterprise']),
      status: 'active',
      commission_rate: faker.number.float({ min: 5, max: 15, fractionDigits: 2 }),
    });
    vendors.push(vendor);

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Created ${i + 1}/${NUM_VENDORS} vendors`);
    }
  }

  console.log(`✅ Created ${vendors.length} vendors`);
  return vendors;
}

async function seedProducts(categories, vendors) {
  console.log(`\n📦 Creating ${NUM_PRODUCTS} products...`);
  let created = 0;
  let skuCounter = 1;

  // Generate product names from category templates
  const productNamesByCategory = {};
  CATEGORY_TEMPLATES.forEach((template, idx) => {
    productNamesByCategory[idx % CATEGORY_TEMPLATES.length] = template.products;
  });

  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const category = categories[i % categories.length];
    const vendor = vendors[i % vendors.length];

    const categoryIdx = categories.indexOf(category) % CATEGORY_TEMPLATES.length;
    const baseProducts = productNamesByCategory[categoryIdx] || ['Sản phẩm'];
    const baseName = faker.helpers.arrayElement(baseProducts);

    // Add variation to product name
    const variations = ['', 'Pro', 'Plus', 'Max', 'Mini', 'Ultra', 'Premium', 'Lite'];
    const color = faker.helpers.arrayElement([
      'Đen',
      'Trắng',
      'Xanh',
      'Đỏ',
      'Vàng',
      'Hồng',
      'Bạc',
      'Vàng gold',
    ]);
    const storage = faker.helpers.arrayElement([
      '64GB',
      '128GB',
      '256GB',
      '512GB',
      '1TB',
      '2TB',
      '4GB RAM',
      '8GB RAM',
      '16GB RAM',
      '',
    ]);
    const variation = faker.helpers.arrayElement(variations);

    const nameParts = [baseName];
    if (variation) nameParts.push(variation);
    if (storage && faker.datatype.boolean()) nameParts.push(storage);
    if (faker.datatype.boolean(0.5)) nameParts.push(color);

    const name = nameParts.join(' ');
    const slug = generateSlug(name) + '-' + uuidv4().slice(0, 8);

    // Generate price between 10,000 VND and 100,000,000 VND
    const price = faker.number.float({
      min: 0.01,
      max: 100000,
      fractionDigits: 2,
    });

    // Sometimes add compare price for "sale" effect
    const comparePrice = faker.datatype.boolean(0.3)
      ? price * faker.number.float({ min: 1.1, max: 2, fractionDigits: 2 })
      : null;

    // Generate random attributes based on category
    const attributes = {
      brand: faker.company.name(),
      warranty: faker.helpers.arrayElement(['6 tháng', '12 tháng', '24 tháng', 'Không bảo hành']),
      origin: faker.helpers.arrayElement([
        'Việt Nam',
        'Trung Quốc',
        'Nhật Bản',
        'Hàn Quốc',
        'Mỹ',
        'Đức',
      ]),
    };

    if (faker.datatype.boolean(0.3)) {
      attributes.material = faker.helpers.arrayElement([
        'Nhựa',
        'Kim loại',
        'Gỗ',
        'Vải',
        'Da',
        'Kính',
      ]);
    }
    if (faker.datatype.boolean(0.3)) {
      attributes.color = color;
    }

    const tags = faker.helpers.arrayElements(
      ['hot', 'new', 'sale', 'bestseller', 'featured', 'trending', 'eco', 'premium'],
      { min: 1, max: 4 },
    );

    const dimensions = {
      length: faker.number.float({ min: 1, max: 200, fractionDigits: 1 }),
      width: faker.number.float({ min: 1, max: 100, fractionDigits: 1 }),
      height: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
    };

    const status = 'active';

    try {
      await Product.create({
        vendor_id: vendor.id,
        category_id: category.id,
        name,
        slug,
        description: faker.lorem.paragraphs({ min: 2, max: 6 }),
        short_description: faker.lorem.sentences({ min: 1, max: 2 }),
        sku: generateSKU(categories.indexOf(category), skuCounter++),
        price: price.toFixed(2),
        compare_price: comparePrice ? comparePrice.toFixed(2) : null,
        cost_price: (price * faker.number.float({ min: 0.3, max: 0.7, fractionDigits: 2 })).toFixed(
          2,
        ),
        weight: faker.number.float({ min: 0.1, max: 50, fractionDigits: 3 }),
        dimensions,
        tags,
        attributes,
        status,
        visibility: faker.helpers.arrayElement(VISIBILITIES),
        stock_status: faker.helpers.weightedArrayElement([
          { value: 'in_stock', weight: 75 },
          { value: 'out_of_stock', weight: 15 },
          { value: 'on_backorder', weight: 10 },
        ]),
        allow_backorders: faker.datatype.boolean(0.2),
        sold_individually: faker.datatype.boolean(0.3),
        featured: faker.datatype.boolean(0.1),
        seo_title: name.length < 60 ? name : name.slice(0, 57) + '...',
        seo_description: faker.lorem.sentences({ min: 1, max: 2 }),
      });

      created++;

      if (created % 100 === 0) {
        console.log(`  ✓ Created ${created}/${NUM_PRODUCTS} products`);
      }
    } catch (error) {
      // Handle duplicate SKU
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.warn('  ⚠ Duplicate SKU, retrying with new SKU...');
        skuCounter++;
        i--; // retry
      } else {
        console.error(`  ✗ Error creating product: ${error.message}`);
      }
    }
  }

  console.log(`✅ Created ${created} products`);
  return created;
}

// Cleanup existing seed data
async function cleanupData() {
  console.log('\n🧹 Cleaning up existing data...');
  try {
    const dialect = sequelize.getDialect();

    if (dialect === 'mysql') {
      // MySQL: Disable FK checks for truncate
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    }

    await Product.destroy({ truncate: true, cascade: true, force: true });
    await Category.destroy({ truncate: true, cascade: true, force: true });
    await Vendor.destroy({ truncate: true, cascade: true, force: true });

    if (dialect === 'mysql') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    console.log('✅ Cleanup completed');
  } catch (error) {
    if (sequelize.getDialect() === 'mysql') {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    }
    console.warn('⚠ Cleanup warning (may be expected on first run):', error.message);
  }
}

async function seed() {
  console.log('═══════════════════════════════════════════════');
  console.log('  🚀 E-COMMERCE SEED DATA GENERATOR');
  console.log('═══════════════════════════════════════════════');

  const startTime = Date.now();

  try {
    // Connect to database
    console.log('\n📡 Connecting to database...');
    await connectDB();
    await sequelize.sync({ alter: false }); // Don't alter schema
    console.log('✅ Database connected');

    // Clean up existing data first
    await cleanupData();

    // Seed data
    const categories = await seedCategories();
    const vendors = await seedVendors();
    const products = await seedProducts(categories, vendors);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════════');
    console.log('  ✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════');
    console.log('  📊 Summary:');
    console.log(`     • Categories: ${categories.length}`);
    console.log(`     • Vendors: ${vendors.length}`);
    console.log(`     • Products: ${products}`);
    console.log(`  ⏱  Duration: ${duration}s`);
    console.log('═══════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed, seedCategories, seedVendors, seedProducts };
