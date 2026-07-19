import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Disable caching for all API routes to ensure real-time synchronization between different devices
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Initial seed data
const INITIAL_BANNERS = [
  {
    id: 'b1',
    title: 'M Phone Shop - Partner Exclusive deals',
    imageUrl: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'b2',
    title: 'iPhone 15 Pro Series - Big Profit margins',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80',
    active: true,
  },
  {
    id: 'b3',
    title: 'Samsung Galaxy S24 Ultra - Special Member Prices',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
    active: true,
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    model: '15 Pro Max',
    description: 'ที่สุดแห่งขุมพลังและดีไซน์ ไทเทเนียมเกรดเดียวกับที่ใช้ในอุตสาหกรรมอวกาศ มาพร้อมชิป A17 Pro ปลดล็อคศักยภาพการเล่นเกมและกราฟิกระดับไฮเอนด์ กล้องหลัก 48MP ซูมแบบออปติคัลได้ถึง 5 เท่า ไหลลื่นไม่มีสะดุดสำหรับลูกค้าในเครือ M Phone Shop เท่านั้น',
    specifications: [
      'ชิปเซ็ต: A17 Pro (3nm)',
      'หน้าจอ: Super Retina XDR OLED 6.7 นิ้ว, 120Hz ProMotion',
      'กล้องหลัง: 48MP (หลัก) + 12MP (Telephoto 5x) + 12MP (Ultra Wide)',
      'กล้องหน้า: 12MP TrueDepth',
      'วัสดุ: ไทเทเนียมเกรด 5, ด้านหลังกระจกผิวด้าน',
      'การเชื่อมต่อ: USB-C (ความเร็วสูงสุด 10 Gb/s), Wi-Fi 6E, 5G',
    ],
    freebies: [
      'อะแดปเตอร์ชาร์จเร็ว M-Fast 30W',
      'ฟิล์มกระจกนิรภัยกันรอยเกรดพรีเมียม Gorilla Glass',
      'เคสใสกันกระแทก M-Armor Carbon Edition',
    ],
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592890284241-75fddec30df4?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v1_1', color: 'Natural Titanium', storage: '256GB', costPrice: 38500, memberPrice: 42900, retailPrice: 48900 },
      { id: 'v1_2', color: 'Natural Titanium', storage: '512GB', costPrice: 45000, memberPrice: 49900, retailPrice: 56900 },
      { id: 'v1_3', color: 'White Titanium', storage: '256GB', costPrice: 38500, memberPrice: 42900, retailPrice: 48900 },
      { id: 'v1_4', color: 'Black Titanium', storage: '256GB', costPrice: 38500, memberPrice: 42900, retailPrice: 48900 },
    ],
    active: true,
    createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'S24 Ultra',
    description: 'สมาร์ทโฟน AI ที่ฉลาดที่สุดในปัจจุบัน ขับเคลื่อนด้วย Galaxy AI ช่วยแปลภาษาแบบเรียลไทม์ขณะโทร สรุปเอกสาร และตกแต่งรูปภาพระดับมืออาชีพ กล้อง 200ล้านพิกเซล ซูมอัจฉริยะ โครงสร้างไทเทเนียมทนทาน พร้อมปากกา S Pen ในตัวเขียนลื่นไหลเป็นธรรมชาติ',
    specifications: [
      'ชิปเซ็ต: Snapdragon 8 Gen 3 for Galaxy',
      'หน้าจอ: Dynamic AMOLED 2X 6.8 นิ้ว, QHD+, 120Hz, ความสว่างสูงสุด 2600 nits',
      'กล้องหลัง: 200MP + 50MP + 12MP + 10MP (กล้องสี่ตัวพร้อม AI Zoom)',
      'กล้องหน้า: 12MP Dual Pixel AF',
      'แบตเตอรี่: 5000 mAh รองรับชาร์จเร็ว 45W',
      'ฟังก์ชันเด่น: ปากกา S Pen, Galaxy AI สั่งการภาษาไทยได้',
    ],
    freebies: [
      'M Phone Shop Exclusive Giftset (ร่ม + กระบอกน้ำเก็บอุณหภูมิ)',
      'เคสซิลิโคนแบรนด์แท้ Samsung Silicone Case',
      'หัวชาร์จแท้ Super Fast Charger 45W',
    ],
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v2_1', color: 'Titanium Gray', storage: '256GB', costPrice: 37000, memberPrice: 40900, retailPrice: 46900 },
      { id: 'v2_2', color: 'Titanium Gray', storage: '512GB', costPrice: 41000, memberPrice: 44900, retailPrice: 52900 },
      { id: 'v2_3', color: 'Titanium Yellow', storage: '256GB', costPrice: 37000, memberPrice: 40900, retailPrice: 46900 },
    ],
    active: true,
    createdAt: '2026-07-11T12:00:00Z',
  },
  {
    id: 'p3',
    name: 'OPPO Reno11 Pro 5G',
    brand: 'OPPO',
    model: 'Reno11 Pro',
    description: 'ผู้เชี่ยวชาญด้านการถ่ายภาพพอร์ตเทรต ดีไซน์ฝาหลังแบบสามมิติประกายระยิบระยับล้ำสมัย กล้องพอร์ตเทรต 32MP ชัดเจนมีมิติราวกับถ่ายด้วยกล้อง DSLR ชาร์จเร็วทันใจด้วยเทคโนโลยี 80W SUPERVOOC ชาร์จเต็ม 100% ภายใน 30 นาที เหมาะสำหรับการนำไปขายต่อกำไรดีมาก',
    specifications: [
      'ชิปเซ็ต: MediaTek Dimensity 8200',
      'หน้าจอ: 3D Curved AMOLED 6.7 นิ้ว, 120Hz',
      'กล้องหลัง: 50MP (หลัก IMX890) + 32MP (Telephoto Portrait) + 8MP (Ultra Wide)',
      'กล้องหน้า: 32MP Ultra-clear Portrait',
      'แบตเตอรี่: 4600 mAh พร้อมชาร์จไว 80W SUPERVOOC',
    ],
    freebies: [
      'OPPO Gift Box (พาวเวอร์แบงค์ 10000mAh + ขาตั้งกล้องบลูทูธ)',
      'ประกันหน้าจอแตกนาน 1 ปีเต็ม',
      'เคสใสแฟชั่น M-Slim เคสใสดีไซน์พิเศษ',
    ],
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v3_1', color: 'Pearl White', storage: '512GB', costPrice: 14500, memberPrice: 16900, retailPrice: 19990 },
      { id: 'v3_2', color: 'Rock Grey', storage: '512GB', costPrice: 14500, memberPrice: 16900, retailPrice: 19990 },
    ],
    active: true,
    createdAt: '2026-07-12T08:00:00Z',
  },
  {
    id: 'p4',
    name: 'Vivo V30 Pro 5G',
    brand: 'vivo',
    model: 'V30 Pro',
    description: 'ร่วมมือกับ ZEISS ในการพัฒนาระบบกล้องเป็นครั้งแรกในตระกูล V Series เพื่อภาพพอร์ตเทรตอันเป็นเอกลักษณ์และวิดีโอสไตล์ภาพยนตร์อันตื่นตาตื่นใจ พร้อมไฟออร่าพอร์ตเทรต Aura Light 3.0 ปรับสีอุณหภูมิอัจฉริยะ นุ่มนวลไม่แสบตา หน้าจอขอบโค้งบางเบาสุดหรูหรา',
    specifications: [
      'ชิปเซ็ต: MediaTek Dimensity 8200 (4nm)',
      'หน้าจอ: 3D Curved AMOLED 6.78 นิ้ว, 1.5K, 120Hz, 2800nits',
      'กล้องหลัง ZEISS: 50MP (หลัก VCS) + 50MP (Portrait) + 50MP (Ultra Wide)',
      'กล้องหน้า: 50MP AF Group Selfie',
      'แบตเตอรี่: 5000 mAh พร้อม 80W FlashCharge บางเบาเพียง 7.45 มม.',
    ],
    freebies: [
      'Vivo V-Box เซ็ตแก้วน้ำสุญญากาศคู่',
      'ฟิล์มไฮโดรเจลพรีเมียมรอบตัวเครื่อง',
      'ชุดชาร์จไว vivo FlashCharge 80W ในกล่อง',
    ],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v4_1', color: 'Green Sea', storage: '512GB', costPrice: 15500, memberPrice: 17900, retailPrice: 20999 },
      { id: 'v4_2', color: 'Shell White', storage: '512GB', costPrice: 15500, memberPrice: 17900, retailPrice: 20999 },
    ],
    active: true,
    createdAt: '2026-07-13T09:00:00Z',
  },
  {
    id: 'p5',
    name: 'Realme GT 6',
    brand: 'realme',
    model: 'GT 6',
    description: 'เรือธงนักฆ่าสเปกโหด ขุมพลัง AI แบตเตอรี่อึดระดับตำนาน หน้าจอสว่างที่สุดในโลกถึง 6000nits เล่นเกมลื่นไหลสูงสุดด้วยชิปรุ่นท็อป ระบบระบายความร้อนขนาดใหญ่ คู่หูคู่ค้า M Phone Shop แนะนำรุ่นนี้ขายคล่องสุดๆ',
    specifications: [
      'ชิปเซ็ต: Snapdragon 8s Gen 3',
      'หน้าจอ: Ultra Bright AMOLED 6.78 นิ้ว, 120Hz, 6000nits',
      'กล้องหลัก: 50MP Sony LYT-808 OIS + 50MP Telephoto + 8MP Ultra Wide',
      'แบตเตอรี่: 5500 mAh + 120W SUPERVOOC ชาร์จเต็มด่วนพิเศษ',
    ],
    freebies: [
      'หูฟังไร้สาย realme Buds Air 5',
      'เคสยางกันกระแทกสีดำด้านดีไซน์พอร์ตเทรต',
      'บัตรรับประกันศูนย์เพิ่มเป็น 2 ปี',
    ],
    images: [
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v5_1', color: 'Fluid Silver', storage: '512GB', costPrice: 18000, memberPrice: 20900, retailPrice: 24990 },
      { id: 'v5_2', color: 'Razor Green', storage: '512GB', costPrice: 18000, memberPrice: 20900, retailPrice: 24990 },
    ],
    active: true,
    createdAt: '2026-07-14T15:30:00Z',
  },
  {
    id: 'p6',
    name: 'AirPods Pro 2 (USB-C)',
    brand: 'Apple',
    model: 'AirPods Pro 2',
    description: 'หูฟังไร้สายอัจฉริยะ ตัดเสียงรบกวนภายนอกได้เงียบขึ้นสูงสุดถึง 2 เท่าด้วยชิป H2 ระบบเสียงตามตำแหน่งส่วนบุคคลสัมผัสประสบการณ์ฟังสมจริง พร้อมเคสชาร์จ MagSafe พอร์ต USB-C ค้นหาตำแหน่งแม่นยำด้วยชิป U1 ลำโพงเสียงเตือนในตัว คุ้มค่ากำไรงาม',
    specifications: [
      'ชิปเสียง: Apple H2 ในหูฟัง, Apple U1 ในเคสชาร์จ MagSafe',
      'การตัดเสียงรบกวน: Active Noise Cancellation (ANC) พัฒนาขึ้น 2 เท่า',
      'โหมดรับฟังเสียงภายนอก: Adaptive Audio, Conversation Awareness',
      'ระยะเวลาใช้งาน: ฟังนานสูงสุด 6 ชั่วโมง (เปิด ANC), สูงสุด 30 ชั่วโมงรวมเคส',
      'การทนน้ำทนฝุ่น: มาตรฐาน IP54 ทั้งหูฟังและเคส',
    ],
    freebies: [
      'เคสซิลิโคนแรนเจอร์กันรอยสีทหารพราน',
      'สายคล้องคอซิลิโคนนิรภัย',
    ],
    images: [
      'https://images.unsplash.com/photo-1588449668338-d15176090c44?w=600&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v6_1', color: 'White', storage: 'One Size', costPrice: 6500, memberPrice: 7500, retailPrice: 8990 },
    ],
    active: true,
    createdAt: '2026-07-15T04:00:00Z',
  }
];

const INITIAL_MEMBERS = [
  {
    id: 'm_admin',
    name: 'M Phone Admin',
    email: 'admin@mphone.com',
    phone: '0812345678',
    shopName: 'M Phone Shop Headquarters',
    active: true,
    role: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    password: 'admin1234',
  },
  {
    id: 'm1',
    name: 'สมชาย ดีเลิศ',
    email: 'somchai@partner.com',
    phone: '0898765432',
    shopName: 'สมชาย โมบาย เชียงใหม่',
    active: true,
    role: 'member',
    createdAt: '2026-07-01T09:00:00Z',
    password: '123456',
  },
  {
    id: 'm2',
    name: 'สุชาดา ใจดี',
    email: 'suchada@partner.com',
    phone: '0854442222',
    shopName: 'สุชาดา เทเลคอม กรุงเทพฯ',
    active: true,
    role: 'member',
    createdAt: '2026-07-05T14:30:00Z',
    password: '123456',
  },
  {
    id: 'm3',
    name: 'ณัฐพล อุปกรณ์เสริม',
    email: 'nattapon@partner.com',
    phone: '0911122233',
    shopName: 'NP Accessories ภูเก็ต',
    active: false,
    role: 'member',
    createdAt: '2026-07-15T11:00:00Z',
    password: '123456',
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-20260715-001',
    memberId: 'm1',
    memberName: 'สมชาย ดีเลิศ',
    memberShopName: 'สมชาย โมบาย เชียงใหม่',
    items: [
      {
        productId: 'p1',
        productName: 'iPhone 15 Pro Max',
        brand: 'Apple',
        color: 'Natural Titanium',
        storage: '256GB',
        quantity: 2,
        memberPrice: 42900,
        retailPrice: 48900,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      },
    ],
    totalAmount: 85800,
    note: 'ส่งขนส่งนิ่มเอ็กซ์เพรส ด่วนพิเศษครับ',
    status: 'preparing',
    createdAt: '2026-07-15T10:15:00-07:00',
    statusHistory: [
      { status: 'pending', timestamp: '2026-07-15T10:15:00-07:00' },
      { status: 'preparing', timestamp: '2026-07-15T13:00:00-07:00' }
    ],
    deliveryType: 'delivery',
    deliveryTime: 'จัดส่งทันที',
    paymentMethod: 'cash'
  },
  {
    id: 'ORD-20260714-002',
    memberId: 'm2',
    memberName: 'สุชาดา ใจดี',
    memberShopName: 'สุชาดา เทเลคอม กรุงเทพฯ',
    items: [
      {
        productId: 'p2',
        productName: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        color: 'Titanium Gray',
        storage: '256GB',
        quantity: 1,
        memberPrice: 40900,
        retailPrice: 46900,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      },
      {
        productId: 'p6',
        productName: 'AirPods Pro 2 (USB-C)',
        brand: 'Apple',
        color: 'White',
        storage: 'One Size',
        quantity: 3,
        memberPrice: 7500,
        retailPrice: 8990,
        image: 'https://images.unsplash.com/photo-1588449668338-d15176090c44?w=600&auto=format&fit=crop&q=80',
      }
    ],
    totalAmount: 63400,
    note: 'ฝากส่งมอเตอร์ไซค์ไรเดอร์ด่วน แถวรามคำแหงค่ะ',
    status: 'completed',
    createdAt: '2026-07-14T08:45:00-07:00',
    statusHistory: [
      { status: 'pending', timestamp: '2026-07-14T08:45:00-07:00' },
      { status: 'preparing', timestamp: '2026-07-14T09:30:00-07:00' },
      { status: 'shipped', timestamp: '2026-07-14T11:00:00-07:00' },
      { status: 'completed', timestamp: '2026-07-14T12:30:00-07:00' }
    ],
    deliveryType: 'delivery',
    deliveryTime: 'ภายในวันนี้',
    paymentMethod: 'cash'
  }
];

const INITIAL_CATEGORIES = ['Apple', 'Samsung', 'OPPO', 'vivo', 'realme', 'Xiaomi'];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'ฉลองปรับปรุงระบบพอร์ทัล M Phone Shop โฉมใหม่! 🌟',
    content: 'ยินดีต้อนรับสมาชิกพันธมิตรดีลเลอร์ทุกท่าน! พอร์ทัลโฉมใหม่มาพร้อมระบบเช็คสถานะออเดอร์เรียลไทม์ ฟอนต์และ UI อ่านง่ายสบายตา และระบบแจ้งข่าวสารด่วนสำหรับสมาชิกค่ะ',
    type: 'news',
    createdAt: '2026-07-16T12:00:00Z',
    active: true,
  },
  {
    id: 'a2',
    title: 'โปรเด็ดสำหรับดีลเลอร์กลุ่มสินค้า Apple และ Samsung! 🔥',
    content: 'ด่วนพิเศษ! ปรับราคาส่งของรุ่น iPhone 15 Pro Max และ Galaxy S24 Ultra ลงชั่วคราวเพื่อช่วยเพิ่มอัตรากำไร (Profit margin) ให้กับสมาชิกทุกท่านตลอดสุดสัปดาห์นี้ค่ะ',
    type: 'promo',
    createdAt: '2026-07-17T08:00:00Z',
    active: true,
  }
];

// Database state management
interface DBState {
  banners: any[];
  products: any[];
  members: any[];
  orders: any[];
  categories: any[];
  announcements?: any[];
}

function getInitialDB(): DBState {
  return {
    banners: INITIAL_BANNERS,
    products: INITIAL_PRODUCTS,
    members: INITIAL_MEMBERS,
    orders: INITIAL_ORDERS,
    categories: INITIAL_CATEGORIES,
    announcements: INITIAL_ANNOUNCEMENTS,
  };
}

// Read database file helper
function readDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (!parsed.announcements) {
        parsed.announcements = INITIAL_ANNOUNCEMENTS;
        writeDB(parsed);
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database file", error);
  }
  
  // Initialize with seed data and save it
  const seed = getInitialDB();
  writeDB(seed);
  return seed;
}

// Write database file helper
let sseClients: any[] = [];

function broadcastState(state: DBState): void {
  const payload = JSON.stringify({ type: "state", data: state });
  sseClients.forEach(client => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (err) {
      // Failed client will be removed on close
    }
  });
}

function writeDB(data: DBState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    broadcastState(data);
  } catch (error) {
    console.error("Error writing database file", error);
  }
}

// --- API ROUTES ---

// GET /api/updates - Server-Sent Events for real-time synchronization
app.get("/api/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // Send initial state immediately
  const state = readDB();
  res.write(`data: ${JSON.stringify({ type: "state", data: state })}\n\n`);

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// GET /api/state - get entire DB
app.get("/api/state", (req, res) => {
  const state = readDB();
  res.json(state);
});

// POST /api/products - save/update product
app.post("/api/products", (req, res) => {
  const product = req.body;
  const state = readDB();
  const idx = state.products.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    state.products[idx] = product;
  } else {
    state.products.push(product);
  }
  writeDB(state);
  res.json({ success: true, product });
});

// DELETE /api/products/:id - delete product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const state = readDB();
  state.products = state.products.filter(p => p.id !== id);
  writeDB(state);
  res.json({ success: true });
});

// POST /api/members - save/update member
app.post("/api/members", (req, res) => {
  const member = req.body;
  const state = readDB();
  const idx = state.members.findIndex(m => m.id === member.id);
  if (idx >= 0) {
    state.members[idx] = member;
  } else {
    state.members.push(member);
  }
  writeDB(state);
  res.json({ success: true, member });
});

// DELETE /api/members/:id - delete member
app.delete("/api/members/:id", (req, res) => {
  const { id } = req.params;
  const state = readDB();
  state.members = state.members.filter(m => m.id !== id || m.id === 'm_admin');
  writeDB(state);
  res.json({ success: true });
});

// POST /api/orders - create order
app.post("/api/orders", (req, res) => {
  const orderData = req.body;
  const state = readDB();
  
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(100 + Math.random() * 900);
  const orderId = `ORD-${dateStr}-${randNum}`;
  
  const newOrder = {
    ...orderData,
    id: orderId,
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }]
  };
  
  state.orders.unshift(newOrder);
  writeDB(state);
  res.json({ success: true, order: newOrder });
});

// PUT /api/orders/:id/status - update order status
app.put("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const state = readDB();
  
  const idx = state.orders.findIndex(o => o.id === id);
  if (idx >= 0) {
    const order = state.orders[idx];
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString()
    });
    state.orders[idx] = order;
    writeDB(state);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// DELETE /api/orders/:id - delete an order
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const state = readDB();
  state.orders = state.orders.filter(o => o.id !== id);
  writeDB(state);
  res.json({ success: true });
});

// POST /api/banners - save/update banner
app.post("/api/banners", (req, res) => {
  const banner = req.body;
  const state = readDB();
  const idx = state.banners.findIndex(b => b.id === banner.id);
  if (idx >= 0) {
    state.banners[idx] = banner;
  } else {
    state.banners.push(banner);
  }
  writeDB(state);
  res.json({ success: true, banner });
});

// DELETE /api/banners/:id - delete banner
app.delete("/api/banners/:id", (req, res) => {
  const { id } = req.params;
  const state = readDB();
  state.banners = state.banners.filter(b => b.id !== id);
  writeDB(state);
  res.json({ success: true });
});

// POST /api/announcements - save/update announcement
app.post("/api/announcements", (req, res) => {
  const ann = req.body;
  const state = readDB();
  if (!state.announcements) {
    state.announcements = [];
  }
  const idx = state.announcements.findIndex(a => a.id === ann.id);
  if (idx >= 0) {
    state.announcements[idx] = ann;
  } else {
    state.announcements.push(ann);
  }
  writeDB(state);
  res.json({ success: true, announcement: ann });
});

// DELETE /api/announcements/:id - delete announcement
app.delete("/api/announcements/:id", (req, res) => {
  const { id } = req.params;
  const state = readDB();
  if (state.announcements) {
    state.announcements = state.announcements.filter(a => a.id !== id);
    writeDB(state);
  }
  res.json({ success: true });
});


// POST /api/categories - add category
app.post("/api/categories", (req, res) => {
  const { category } = req.body;
  const state = readDB();
  const normalized = category.trim();
  if (normalized && !state.categories.some((c: string) => c.toLowerCase() === normalized.toLowerCase())) {
    state.categories.push(normalized);
    writeDB(state);
  }
  res.json({ success: true, categories: state.categories });
});

// DELETE /api/categories/:name - delete category
app.delete("/api/categories/:name", (req, res) => {
  const { name } = req.params;
  const state = readDB();
  state.categories = state.categories.filter((c: string) => c.toLowerCase() !== name.toLowerCase());
  writeDB(state);
  res.json({ success: true, categories: state.categories });
});

// POST /api/reset - reset to seed
app.post("/api/reset", (req, res) => {
  const seed = getInitialDB();
  writeDB(seed);
  res.json({ success: true, state: seed });
});

// Check/write DB on boot
readDB();

// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
