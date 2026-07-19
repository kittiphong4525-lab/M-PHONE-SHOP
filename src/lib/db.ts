import { Product, Member, Order, PromoBanner, OrderStatus, Announcement } from '../types';

// Pre-seeded banners
const INITIAL_BANNERS: PromoBanner[] = [
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

// Pre-seeded products
const INITIAL_PRODUCTS: Product[] = [
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

// Pre-seeded members
const INITIAL_MEMBERS: Member[] = [
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

// Pre-seeded orders
const INITIAL_ORDERS: Order[] = [
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

type DatabaseListener = () => void;

interface CachedState {
  products: Product[];
  members: Member[];
  orders: Order[];
  banners: PromoBanner[];
  categories: string[];
  announcements: Announcement[];
}

// Client-side Database sync with background polling and optimistic UI
export class MPhoneDatabase {
  private static cache: CachedState = {
    products: MPhoneDatabase.getStored<Product[]>('mphone_products', INITIAL_PRODUCTS),
    members: MPhoneDatabase.getStored<Member[]>('mphone_members', INITIAL_MEMBERS),
    orders: MPhoneDatabase.getStored<Order[]>('mphone_orders', INITIAL_ORDERS),
    banners: MPhoneDatabase.getStored<PromoBanner[]>('mphone_banners', INITIAL_BANNERS),
    categories: MPhoneDatabase.getStored<string[]>('mphone_categories', ['Apple', 'Samsung', 'OPPO', 'vivo', 'realme', 'Xiaomi']),
    announcements: MPhoneDatabase.getStored<Announcement[]>('mphone_announcements', []),
  };

  private static listeners: Set<DatabaseListener> = new Set();
  private static pollingStarted = false;
  private static eventSource: EventSource | null = null;

  private static getStored<T>(key: string, defaultVal: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // Register components to receive real-time updates
  static subscribe(listener: DatabaseListener): () => void {
    this.listeners.add(listener);
    
    // Start polling automatically if not already started
    if (!this.pollingStarted) {
      this.pollingStarted = true;
      this.startPolling();
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error('Listener callback failed', err);
      }
    });
  }

  // Background server state sync (Every 2 seconds)
  private static startPolling() {
    // Initial sync
    this.syncWithServer();

    // Connect to real-time updates via Server-Sent Events (SSE)
    this.startSSE();

    // Fallback polling (less frequent since SSE handles instant updates)
    setInterval(() => {
      this.syncWithServer();
    }, 15000);
  }

  private static startSSE() {
    if (this.eventSource) return;

    try {
      this.eventSource = new EventSource('/api/updates');

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'state' && payload.data) {
            this.updateCache(payload.data);
          }
        } catch (e) {
          console.error('Error parsing SSE real-time update', e);
        }
      };

      this.eventSource.onerror = (err) => {
        console.warn('SSE connection closed or failed. Retrying in background...', err);
        // Browser automatically handles reconnections for EventSource.
      };
    } catch (e) {
      console.error('Failed to initialize Server-Sent Events', e);
    }
  }

  static updateCache(data: CachedState): void {
    let hasChanges = false;
    
    // Compare state to avoid unnecessary re-renders
    if (JSON.stringify(data.products) !== JSON.stringify(this.cache.products)) {
      this.cache.products = data.products;
      this.setStored('mphone_products', data.products);
      hasChanges = true;
    }
    if (JSON.stringify(data.members) !== JSON.stringify(this.cache.members)) {
      this.cache.members = data.members;
      this.setStored('mphone_members', data.members);
      hasChanges = true;
    }
    if (JSON.stringify(data.orders) !== JSON.stringify(this.cache.orders)) {
      this.cache.orders = data.orders;
      this.setStored('mphone_orders', data.orders);
      hasChanges = true;
    }
    if (JSON.stringify(data.banners) !== JSON.stringify(this.cache.banners)) {
      this.cache.banners = data.banners;
      this.setStored('mphone_banners', data.banners);
      hasChanges = true;
    }
    if (JSON.stringify(data.categories) !== JSON.stringify(this.cache.categories)) {
      this.cache.categories = data.categories;
      this.setStored('mphone_categories', data.categories);
      hasChanges = true;
    }
    if (data.announcements && JSON.stringify(data.announcements) !== JSON.stringify(this.cache.announcements)) {
      this.cache.announcements = data.announcements;
      this.setStored('mphone_announcements', data.announcements);
      hasChanges = true;
    }

    if (hasChanges) {
      this.notify();
    }
  }

  static async syncWithServer(): Promise<void> {
    try {
      const res = await fetch(`/api/state?_t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Sync failed');
      const data: CachedState = await res.json();
      this.updateCache(data);
    } catch (err) {
      // Gracefully log & keep using local cache (offline resilience)
      console.log('Background server sync offline/delayed', err);
    }
  }

  // Synchronous GET APIs (Instant rendering from RAM)
  static getProducts(): Product[] {
    return this.cache.products;
  }

  static getMembers(): Member[] {
    return this.cache.members;
  }

  static getOrders(): Order[] {
    return this.cache.orders;
  }

  static getBanners(): PromoBanner[] {
    return this.cache.banners;
  }

  static getAnnouncements(): Announcement[] {
    return this.cache.announcements || [];
  }

  static getCategories(): string[] {
    return this.cache.categories;
  }

  // Auth - Login async checks server
  static async login(email: string, password?: string): Promise<Member> {
    await this.syncWithServer();
    const cleanEmail = email.trim().toLowerCase();
    const found = this.cache.members.find(m => m.email.toLowerCase() === cleanEmail);
    
    if (found) {
      if (!found.active) {
        throw new Error('บัญชีนี้ถูกปิดใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
      }
      const expectedPassword = found.password || '123456';
      if (password !== expectedPassword) {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
      return found;
    }

    if (cleanEmail === 'admin@mphone.com') {
      if (password !== 'admin1234') {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
      // Trigger a reload to sync from server if it failed
      throw new Error('กรุณารอระบบฐานข้อมูลออนไลน์ติดตั้งสักครู่แล้วลองใหม่อีกครั้ง');
    }

    throw new Error('อีเมลผู้ใช้งานไม่ถูกต้อง หรือไม่ได้รับสิทธิ์เข้าใช้งานระบบ');
  }

  // --- WRITE / MUTATION APIS ---

  // Product Methods
  static saveProduct(product: Product): Product {
    // Optimistic cache update
    const idx = this.cache.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      this.cache.products[idx] = product;
    } else {
      this.cache.products.push(product);
    }
    this.setStored('mphone_products', this.cache.products);
    this.notify();

    // Async server update
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).catch(err => console.error('Error saving product on server', err));

    return product;
  }

  static deleteProduct(id: string): void {
    // Optimistic cache update
    this.cache.products = this.cache.products.filter(p => p.id !== id);
    this.setStored('mphone_products', this.cache.products);
    this.notify();

    // Async server update
    fetch(`/api/products/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting product on server', err));
  }

  // Member Methods
  static saveMember(member: Member): Member {
    // Optimistic cache update
    const idx = this.cache.members.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      this.cache.members[idx] = member;
    } else {
      this.cache.members.push(member);
    }
    this.setStored('mphone_members', this.cache.members);
    this.notify();

    // Async server update
    fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    }).catch(err => console.error('Error saving member on server', err));

    return member;
  }

  static deleteMember(id: string): void {
    // Optimistic cache update
    this.cache.members = this.cache.members.filter(m => m.id !== id || m.id === 'm_admin');
    this.setStored('mphone_members', this.cache.members);
    this.notify();

    // Async server update
    fetch(`/api/members/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting member on server', err));
  }

  // Order Methods
  static createOrder(order: Omit<Order, 'id' | 'createdAt' | 'statusHistory'>): Order {
    // Optimistic local ID generation and structure for instant UI response
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-${dateStr}-${randNum}`;
    
    const newOrder: Order = {
      ...order,
      id: orderId,
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: 'pending', timestamp: new Date().toISOString() }]
    };
    
    this.cache.orders.unshift(newOrder);
    this.setStored('mphone_orders', this.cache.orders);
    this.notify();

    // Async server update
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).then(async res => {
      if (res.ok) {
        // Fetch fresh state to sync correct IDs/history from server
        this.syncWithServer();
      }
    }).catch(err => console.error('Error creating order on server', err));

    return newOrder;
  }

  static updateOrderStatus(id: string, status: OrderStatus): Order | null {
    // Optimistic cache update
    const idx = this.cache.orders.findIndex(o => o.id === id);
    if (idx >= 0) {
      const order = this.cache.orders[idx];
      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date().toISOString()
      });
      this.cache.orders[idx] = order;
      this.setStored('mphone_orders', this.cache.orders);
      this.notify();

      // Async server update
      fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(err => console.error('Error updating order status on server', err));

      return order;
    }
    return null;
  }

  static deleteOrder(id: string): void {
    // Optimistic cache update
    this.cache.orders = this.cache.orders.filter(o => o.id !== id);
    this.setStored('mphone_orders', this.cache.orders);
    this.notify();

    // Async server update
    fetch(`/api/orders/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting order on server', err));
  }

  // Banner Methods
  static saveBanner(banner: PromoBanner): PromoBanner {
    // Optimistic cache update
    const idx = this.cache.banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      this.cache.banners[idx] = banner;
    } else {
      this.cache.banners.push(banner);
    }
    this.setStored('mphone_banners', this.cache.banners);
    this.notify();

    // Async server update
    fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(banner)
    }).catch(err => console.error('Error saving banner on server', err));

    return banner;
  }

  static deleteBanner(id: string): void {
    // Optimistic cache update
    this.cache.banners = this.cache.banners.filter(b => b.id !== id);
    this.setStored('mphone_banners', this.cache.banners);
    this.notify();

    // Async server update
    fetch(`/api/banners/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting banner on server', err));
  }

  static saveAnnouncement(announcement: Announcement): Announcement {
    if (!this.cache.announcements) {
      this.cache.announcements = [];
    }
    const idx = this.cache.announcements.findIndex(a => a.id === announcement.id);
    if (idx >= 0) {
      this.cache.announcements[idx] = announcement;
    } else {
      this.cache.announcements.push(announcement);
    }
    this.setStored('mphone_announcements', this.cache.announcements);
    this.notify();

    // Async server update
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement)
    }).catch(err => console.error('Error saving announcement on server', err));

    return announcement;
  }

  static deleteAnnouncement(id: string): void {
    if (!this.cache.announcements) return;
    this.cache.announcements = this.cache.announcements.filter(a => a.id !== id);
    this.setStored('mphone_announcements', this.cache.announcements);
    this.notify();

    // Async server update
    fetch(`/api/announcements/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting announcement on server', err));
  }


  // Category Methods
  static addCategory(category: string): string[] {
    const normalized = category.trim();
    if (normalized && !this.cache.categories.some(c => c.toLowerCase() === normalized.toLowerCase())) {
      // Optimistic cache update
      this.cache.categories.push(normalized);
      this.setStored('mphone_categories', this.cache.categories);
      this.notify();

      // Async server update
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      }).catch(err => console.error('Error adding category on server', err));
    }
    return this.cache.categories;
  }

  static deleteCategory(category: string): string[] {
    // Optimistic cache update
    this.cache.categories = this.cache.categories.filter(c => c.toLowerCase() !== category.toLowerCase());
    this.setStored('mphone_categories', this.cache.categories);
    this.notify();

    // Async server update
    fetch(`/api/categories/${encodeURIComponent(category)}`, {
      method: 'DELETE'
    }).catch(err => console.error('Error deleting category on server', err));

    return this.cache.categories;
  }

  // Reset data back to initial seed
  static resetToSeed(): void {
    fetch('/api/reset', { method: 'POST' })
      .then(() => this.syncWithServer())
      .catch(err => console.error('Error resetting database on server', err));
  }
}
