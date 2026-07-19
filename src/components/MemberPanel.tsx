import React, { useState, useEffect, useRef } from 'react';
import { MPhoneDatabase } from '../lib/db';
import { Product, Member, Order, PromoBanner, CartItem, ProductVariant, OrderStatus, Announcement } from '../types';
import { 
  Search, ShoppingCart, User, ClipboardList, Grid, Smartphone, 
  Plus, Minus, Trash2, X, ShoppingBag, Gift, ListTodo, ShieldCheck, 
  MapPin, Phone, Mail, LogOut, ChevronRight, HelpCircle, ZoomIn, 
  AlertCircle, Sparkles, Check, Package, CheckCircle2, Clock, Truck, RefreshCw, Car, Store,
  Sun, Moon, Download, Share2, Bell, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

interface MemberPanelProps {
  currentUser: Member;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

type MemberTab = 'home' | 'categories' | 'cart' | 'orders' | 'account';

export default function MemberPanel({ currentUser, onLogout, theme, toggleTheme }: MemberPanelProps) {
  const { success, error, warning, info } = useToast();
  const [activeTab, setActiveTab] = useState<MemberTab>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandsList, setBrandsList] = useState<string[]>([]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState('');

  // Checkout Option States
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [creditDays, setCreditDays] = useState<7 | 10 | 30>(7);

  // Selected Product for Details View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailColor, setDetailColor] = useState('');
  const [detailStorage, setDetailStorage] = useState('');
  const [detailQty, setDetailQty] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showAppCard, setShowAppCard] = useState(() => localStorage.getItem('mphone_app_downloaded') !== 'true');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Promotion Banner slider state
  const [bannerIndex, setBannerIndex] = useState(0);

  // Custom toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flying items state for fly-to-cart animation
  const [flyingItems, setFlyingItems] = useState<{
    id: string;
    image: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }[]>([]);

  // Cart bounce animation state
  const [cartBouncing, setCartBouncing] = useState(false);

  // Custom delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Capture PWA Installation prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    const handleAppInstalled = () => {
      localStorage.setItem('mphone_app_downloaded', 'true');
      setShowAppCard(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('mphone_app_downloaded', 'true');
          setShowAppCard(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('PWA prompt error:', err);
      }
    } else {
      // Fallback: Show instructions modal for iOS Safari or unsupported browsers
      window.dispatchEvent(new CustomEvent('show-install-guide'));
    }
  };

  // Load Data
  useEffect(() => {
    fetchData();
    // Load local cart if exists
    try {
      const savedCart = localStorage.getItem(`mphone_cart_${currentUser.id}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}

    const unsubscribe = MPhoneDatabase.subscribe(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const fetchData = () => {
    // Only fetch active products for members
    const allProducts = MPhoneDatabase.getProducts().filter(p => p.active);
    setProducts(allProducts);
    setBanners(MPhoneDatabase.getBanners().filter(b => b.active));
    setBrandsList(MPhoneDatabase.getCategories());
    setAnnouncements(MPhoneDatabase.getAnnouncements().filter(a => a.active));
    
    // Filter orders specific to this member
    const memberOrders = MPhoneDatabase.getOrders().filter(o => o.memberId === currentUser.id);
    setOrders(memberOrders);
  };

  // Save cart state helper
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem(`mphone_cart_${currentUser.id}`, JSON.stringify(newCart));
    } catch {}
  };

  // Auto-play banner slider
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners]);

  // Auto clear toast message after 1 second
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle open details modal
  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    // Default to first variant's details
    if (prod.variants.length > 0) {
      setDetailColor(prod.variants[0].color);
      setDetailStorage(prod.variants[0].storage);
    }
    setDetailQty(1);
    setActiveImgIndex(0);
    setIsZoomed(false);
  };

  // Find the exact variant based on user color/storage selection
  const getSelectedVariant = (prod: Product): ProductVariant | undefined => {
    return prod.variants.find(v => v.color === detailColor && v.storage === detailStorage);
  };

  // Add to Cart Logic
  const handleAddToCart = (prod: Product, directQty?: number, event?: React.MouseEvent) => {
    const color = directQty ? prod.variants[0].color : detailColor;
    const storage = directQty ? prod.variants[0].storage : detailStorage;
    const qty = directQty || detailQty;
    
    const variant = prod.variants.find(v => v.color === color && v.storage === storage);
    if (!variant) {
      error('ขออภัย! ตัวเลือกสีหรือความจำนี้ไม่พร้อมใช้งาน', 'สินค้าไม่พร้อมจำหน่าย');
      return;
    }

    const cartItemId = `${prod.id}-${color}-${storage}`;
    const existingIdx = cart.findIndex(item => item.id === cartItemId);
    
    let updatedCart = [...cart];
    if (existingIdx >= 0) {
      updatedCart[existingIdx].quantity += qty;
    } else {
      updatedCart.push({
        id: cartItemId,
        product: prod,
        selectedColor: color,
        selectedStorage: storage,
        quantity: qty,
        memberPrice: variant.memberPrice,
        retailPrice: variant.retailPrice
      });
    }

    saveCart(updatedCart);
    setSelectedProduct(null); // Close modal
    
    // Smooth scroll or toast mock
    setToastMessage(`เพิ่ม "${prod.name} (${color}/${storage}) x${qty} เครื่อง" ลงตะกร้าแล้ว`);
    success(`เพิ่ม "${prod.name} (${color}/${storage}) x${qty} เครื่อง" ลงตะกร้าแล้ว`, 'เพิ่มในตะกร้าสำเร็จ');
    
    // Trigger Flying Item Animation
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    
    if (event) {
      startX = event.clientX;
      startY = event.clientY;
    } else {
      const sourceEl = document.getElementById(`quick-add-${prod.id}`) || document.getElementById('add-to-cart-modal-btn');
      if (sourceEl) {
        const rect = sourceEl.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      }
    }

    let endX = window.innerWidth - 80;
    let endY = 40;
    
    const desktopCartEl = document.getElementById('header-cart-btn');
    const mobileCartEl = document.getElementById('mobile-tab-cart');
    
    if (window.innerWidth < 768 && mobileCartEl) {
      const rect = mobileCartEl.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    } else if (desktopCartEl) {
      const rect = desktopCartEl.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const productImage = prod.images && prod.images.length > 0 
      ? prod.images[0] 
      : 'https://images.unsplash.com/photo-1511707171634-5f897ff02e22?w=150';

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      image: productImage,
      startX,
      startY,
      endX,
      endY
    };

    setFlyingItems((prev) => [...prev, newItem]);
  };
  const handleUpdateCartQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cart.find(i => i.id === id);
    const updated = cart.filter(i => i.id !== id);
    saveCart(updated);
    if (item) {
      success(`นำ "${item.product.name}" ออกจากตะกร้าแล้ว`, 'ลบสำเร็จ');
    }
  };

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      error('กรุณาเลือกสินค้าใส่ตะกร้าก่อนส่งออเดอร์', 'ตะกร้าสินค้าว่างเปล่า');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.memberPrice * item.quantity), 0);

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      brand: item.product.brand,
      color: item.selectedColor,
      storage: item.selectedStorage,
      quantity: item.quantity,
      memberPrice: item.memberPrice,
      retailPrice: item.retailPrice,
      image: item.product.images[0]
    }));

    MPhoneDatabase.createOrder({
      memberId: currentUser.id,
      memberName: currentUser.name,
      memberShopName: currentUser.shopName,
      items: orderItems,
      totalAmount: total,
      note: orderNote,
      status: 'pending',
      deliveryType,
      deliveryTime: deliveryTime.trim() || (deliveryType === 'delivery' ? 'จัดส่งด่วนที่สุด' : 'รับหน้าร้านวันนี้'),
      paymentMethod,
      creditDays: paymentMethod === 'credit' ? creditDays : undefined
    });

    // Clear cart and checkout selections
    saveCart([]);
    setOrderNote('');
    setDeliveryTime('');
    setPaymentMethod('cash');
    success('ส่งรายการคำสั่งซื้อของท่านเข้าสู่ระบบแล้ว! รอกรรมการอนุมัติ', 'ส่งคำสั่งซื้อสำเร็จ');
    setActiveTab('orders');
    fetchData(); // Refresh history
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteConfirm({
      title: 'ยืนยันการยกเลิก/ลบออเดอร์',
      message: `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกหรือลบรายการสั่งซื้อหมายเลข "${id}" นี้ออกจากระบบ?`,
      onConfirm: () => {
        MPhoneDatabase.deleteOrder(id);
        fetchData();
        success(`ยกเลิกและลบคำสั่งซื้อหมายเลข "${id}" สำเร็จแล้ว`, 'ลบสำเร็จ');
      }
    });
  };

  // Calculated properties
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.memberPrice * item.quantity), 0);
  const cartTotalEstimatedProfit = cart.reduce((sum, item) => {
    const diff = item.retailPrice - item.memberPrice;
    return sum + (diff * item.quantity);
  }, 0);

  // brandsList is now loaded dynamically as state from MPhoneDatabase

  // Filtered Products Grid
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = selectedBrand ? p.brand.toLowerCase() === selectedBrand.toLowerCase() : true;
    return matchSearch && matchBrand;
  });

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col pb-24 md:pb-6 overflow-x-hidden">
      {/* DESKTOP TOP HEADER NAV */}
      <header className="sticky top-0 bg-black/85 backdrop-blur-md border-b border-white/5 py-4 px-6 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00B140] flex items-center justify-center font-bold text-black text-sm shadow shadow-[#00B140]/10">
              M
            </div>
            <div>
              <span className="font-bold text-base tracking-wide">M PHONE <span className="text-[#00B140]">SHOP</span></span>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">ดีลเลอร์พอร์ทัล</p>
            </div>
          </div>

          {/* Desktop Tab Buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            <button 
              onClick={() => setActiveTab('home')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === 'home' ? 'bg-white/5 text-[#00B140] border border-[#00B140]/30' : 'text-gray-400 hover:text-white'}`}
              id="desktop-tab-home"
            >
              หน้าแรก
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === 'categories' ? 'bg-white/5 text-[#00B140] border border-[#00B140]/30' : 'text-gray-400 hover:text-white'}`}
              id="desktop-tab-categories"
            >
              หมวดหมู่ยี่ห้อ
            </button>
            <button 
              onClick={() => setActiveTab('cart')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition relative duration-350 ${
                cartBouncing ? 'scale-110 bg-[#00B140]/20 text-[#00B140] border border-[#00B140]' : (activeTab === 'cart' ? 'bg-white/5 text-[#00B140] border border-[#00B140]/30' : 'text-gray-400 hover:text-white')
              }`}
              id="desktop-tab-cart"
            >
              ตะกร้าสินค้า
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00B140] text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition relative ${activeTab === 'orders' ? 'bg-white/5 text-[#00B140] border border-[#00B140]/30' : 'text-gray-400 hover:text-white'}`}
              id="desktop-tab-orders"
            >
              ประวัติสั่งซื้อ
              {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${activeTab === 'account' ? 'bg-white/5 text-[#00B140] border border-[#00B140]/30' : 'text-gray-400 hover:text-white'}`}
              id="desktop-tab-account"
            >
              บัญชีฉัน
            </button>
          </div>

          {/* Desktop Right Info Panel */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white truncate max-w-[150px]">{currentUser.name}</div>
              <div className="text-[10px] text-[#00B140] font-semibold">{currentUser.shopName}</div>
            </div>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer text-yellow-400 transition-all flex items-center justify-center"
              title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              id="theme-toggle-btn"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-500" />
              )}
            </button>

            <button 
              onClick={() => setActiveTab('cart')}
              className={`p-2.5 bg-white/5 hover:bg-white/10 rounded-xl relative cursor-pointer transition-all duration-350 ${
                cartBouncing ? 'scale-125 border-[#00B140]/50 border shadow-lg shadow-[#00B140]/20 bg-[#00B140]/10' : ''
              }`}
              id="header-cart-btn"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#00B140] text-black text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#111111]">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 overflow-y-auto min-w-0">

        {/* --- 1. HOME TAB --- */}
        {activeTab === 'home' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Search Bar section */}
            <div className="relative w-full max-w-2xl mx-auto mb-4">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="ค้นหามือถือ อุปกรณ์เสริม เช่น iPhone, Samsung S24..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4.5 bg-[#1E1E1E] border border-white/5 focus:border-[#00B140]/60 rounded-2xl text-base text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00B140]/30 transition"
                id="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Slider Banner Promotion */}
            {banners.length > 0 && (
              <div className="relative h-44 sm:h-64 lg:h-80 w-full rounded-2xl overflow-hidden shadow-xl border border-white/5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={bannerIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={banners[bannerIndex].imageUrl} 
                      alt={banners[bannerIndex].title} 
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/35 to-transparent flex flex-col justify-end p-6">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#00B140] text-black text-[9px] font-extrabold uppercase rounded-full mb-2 w-max tracking-wide">
                        <Sparkles className="w-3 h-3" /> โปรเด็ดเฉพาะสมาชิก
                      </div>
                      <h3 className="font-bold text-lg sm:text-2xl text-white keep-white tracking-tight drop-shadow max-w-xl">{banners[bannerIndex].title}</h3>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Banner Slide indicators */}
                <div className="absolute bottom-4 right-6 flex gap-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBannerIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${bannerIndex === idx ? 'bg-[#00B140] w-6' : 'bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Announcements and News Section */}
            {announcements.length > 0 && (
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00B140]/10 rounded-xl text-[#00B140]">
                      <Megaphone className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white">ข่าวสารสมาชิก 📢</h4>
                      <p className="text-[11px] text-gray-400">ข่าวสารล่าสุด โปรโมชั่นพิเศษ และประกาศสำคัญจากทางร้าน</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00B140]/15 text-[#00B140] px-2.5 py-1 rounded-full font-bold">
                    {announcements.length} ประกาศ
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.map((ann) => (
                    <motion.div
                      key={ann.id}
                      whileHover={{ scale: 1.01, translateY: -2 }}
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="cursor-pointer p-4 bg-[#222] hover:bg-[#282828] border border-white/5 hover:border-[#00B140]/20 rounded-xl transition duration-200 flex gap-3 relative overflow-hidden"
                    >
                      {/* Left color bar based on type */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        ann.type === 'promo' ? 'bg-amber-500' :
                        ann.type === 'alert' ? 'bg-red-500' :
                        ann.type === 'news' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      
                      <div className="flex-1 space-y-1.5 pl-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            ann.type === 'promo' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            ann.type === 'alert' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            ann.type === 'news' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            'bg-[#00B140]/10 text-[#00B140] border border-[#00B140]/20'
                          }`}>
                            {ann.type === 'promo' ? 'โปรโมชั่น' :
                             ann.type === 'alert' ? 'ด่วนที่สุด' :
                             ann.type === 'news' ? 'ข่าวสาร' : 'ทั่วไป'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium font-mono">
                            {new Date(ann.createdAt).toLocaleDateString('th-TH', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-white line-clamp-1 hover:text-[#00B140] transition">
                          {ann.title}
                        </h5>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-500 self-center shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Circular Brands Filter */}
            <div className="py-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">แบรนด์แนะนํายอดฮิต (Brand Categories)</h4>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`flex flex-col items-center gap-2 shrink-0 cursor-pointer group`}
                  id="brand-filter-all"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${
                    selectedBrand === null ? 'bg-[#00B140]/15 border-[#00B140]' : 'bg-[#1E1E1E] border-white/5 group-hover:border-white/20'
                  }`}>
                    <Grid className={`w-6 h-6 ${selectedBrand === null ? 'text-[#00B140]' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-300">ทั้งหมด</span>
                </button>

                {brandsList.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                    id={`brand-filter-${brand}`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border ${
                      selectedBrand?.toLowerCase() === brand.toLowerCase() ? 'bg-[#00B140]/15 border-[#00B140]' : 'bg-[#1E1E1E] border-white/5 group-hover:border-white/20'
                    }`}>
                      <Smartphone className={`w-5 h-5 ${selectedBrand?.toLowerCase() === brand.toLowerCase() ? 'text-[#00B140]' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-[11px] font-medium text-gray-300">{brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Catalog Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">รายการสินค้า (Dealer Catalog)</h3>
                <span className="text-xs font-medium text-gray-500 shrink-0">พบ {filteredProducts.length} ชิ้น</span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-[#1E1E1E]/30 rounded-2xl border border-white/5">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium text-sm">ไม่พบสินค้าในหมวดหมู่นี้ชั่วคราว</p>
                  <button onClick={() => { setSelectedBrand(null); setSearchTerm(''); }} className="mt-4 text-xs text-[#00B140] font-semibold hover:underline">
                    ล้างตัวกรองและค้นหาทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredProducts.map((prod, idx) => {
                    const primaryVar = prod.variants[0];
                    const profit = primaryVar.retailPrice - primaryVar.memberPrice;

                    return (
                      <motion.div 
                        key={prod.id} 
                        onClick={() => handleOpenProduct(prod)}
                        className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col glow-green-hover transition-all duration-300 cursor-pointer relative group"
                        id={`product-card-${prod.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                      >
                        {/* Badges */}
                        <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-10 flex gap-1.5">
                          <span className="bg-black/60 backdrop-blur-md text-[#00B140] text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded sm:rounded-md border border-[#00B140]/30">
                            {prod.brand}
                          </span>
                        </div>

                        {/* Image Canvas */}
                        <div className="h-32 sm:h-48 bg-black/30 flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Text Specs */}
                        <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-0.5 sm:space-y-1">
                            <h4 className="font-semibold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-[#00B140] transition-colors">{prod.name}</h4>
                            <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">สี: {Array.from(new Set(prod.variants.map(v => v.color))).join(', ')}</div>
                            <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium truncate">ความจุ: {Array.from(new Set(prod.variants.map(v => v.storage))).join('/')}</div>
                          </div>

                          <div className="mt-2.5 sm:mt-4 pt-2.5 sm:pt-3.5 border-t border-white/5 space-y-1.5 sm:space-y-2">
                            {/* Pricing Breakdown & Explanation */}
                            <div className="flex justify-between items-center text-[10px] sm:text-xs">
                              <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">ราคาขายปลีก (RRP):</span>
                              <span className="font-semibold text-gray-400 font-mono">฿{primaryVar.retailPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] sm:text-xs">
                              <span className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">ราคาส่ง:</span>
                              <span className="font-extrabold text-[#00B140] font-mono">฿{primaryVar.memberPrice.toLocaleString()}</span>
                            </div>

                            {/* Estimated Profit badge */}
                            <div className="bg-[#00B140]/10 border border-[#00B140]/20 rounded-xl p-1.5 sm:p-2 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8px] sm:text-[10px] text-gray-300 font-medium">กำไรโดยประมาณ:</span>
                                <span className="text-[10px] sm:text-xs font-bold text-[#00B140] font-mono">+{profit.toLocaleString()} ฿</span>
                              </div>
                              <div className="hidden sm:block text-[8px] text-gray-500 text-right font-medium">
                                (สูตร: ราคาแนะนำ RRP ฿{primaryVar.retailPrice.toLocaleString()} - ราคาส่ง ฿{primaryVar.memberPrice.toLocaleString()})
                              </div>
                            </div>

                            {/* CTA Button overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // prevent modal trigger
                                handleAddToCart(prod, 1, e);
                              }}
                              className="w-full py-2 sm:py-2.5 bg-white/5 hover:bg-[#00B140] hover:text-black text-white text-[10px] sm:text-xs font-semibold rounded-xl transition duration-150 border border-white/10 hover:border-transparent flex items-center justify-center gap-1 cursor-pointer"
                              id={`quick-add-${prod.id}`}
                            >
                              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="hidden sm:inline">เพิ่มลงตะกร้าด่วน</span>
                              <span className="inline sm:hidden">ใส่ตะกร้า</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- 2. CATEGORIES TAB --- */}
        {activeTab === 'categories' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">เลือกดูสินค้าแบ่งตามแบรนด์ (Filter Brand Category)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {brandsList.map((brand, idx) => {
                const count = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;
                return (
                  <motion.button
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      setActiveTab('home');
                    }}
                    className="p-5 bg-[#1E1E1E] hover:bg-[#00B140]/10 border border-white/5 hover:border-[#00B140]/30 rounded-2xl text-left transition-all duration-200 group cursor-pointer"
                    id={`category-box-${brand}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#00B140]/20 flex items-center justify-center mb-3 text-gray-400 group-hover:text-[#00B140] transition">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#00B140] transition">{brand}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{count} รายการพร้อมขาย</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- 3. SHOPPING CART TAB --- */}
        {activeTab === 'cart' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">ตะกร้าสินค้าของฉัน (Shopping Cart)</h3>
            
            {cart.length === 0 ? (
              <div className="text-center py-16 bg-[#1E1E1E]/30 rounded-2xl border border-white/5 space-y-4">
                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto" />
                <p className="text-gray-400 font-medium text-sm">ตะกร้าสินค้าของท่านยังว่างเปล่า</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2.5 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs transition cursor-pointer"
                  id="cart-go-shopping"
                >
                  ไปเลือกดูสินค้าที่นี่
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of items */}
                <div className="lg:col-span-2 space-y-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-0 sm:divide-y sm:divide-white/5 sm:bg-[#1E1E1E] sm:border sm:border-white/5 sm:rounded-2xl sm:overflow-hidden">
                    {cart.map((item, idx) => {
                      const profitPerUnit = item.retailPrice - item.memberPrice;
                      const totalProfit = profitPerUnit * item.quantity;

                      return (
                        <motion.div 
                          key={item.id} 
                          className="p-3 sm:p-4 bg-[#1E1E1E] border border-white/5 sm:bg-transparent sm:border-none rounded-2xl sm:rounded-none flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between text-center sm:text-left relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.04 }}
                        >
                          {/* Image */}
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name} 
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl mx-auto sm:mx-0 shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0 w-full text-left">
                            <h4 className="font-bold text-xs text-white truncate">{item.product.name}</h4>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">สี: {item.selectedColor}</p>
                            <p className="text-[9px] sm:text-[10px] text-gray-400">สเปก: {item.selectedStorage}</p>
                            <p className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold mt-1">กำไร: +{totalProfit.toLocaleString()} ฿</p>
                          </div>

                          {/* Qty Adjustment */}
                          <div className="flex items-center justify-between gap-2.5 bg-black/40 border border-white/5 rounded-xl px-2 py-1 shrink-0 w-full sm:w-auto">
                            <button 
                              onClick={() => handleUpdateCartQty(item.id, -1)}
                              className="p-1 text-gray-400 hover:text-[#00B140]"
                            >
                              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <span className="text-[11px] sm:text-xs font-bold font-mono text-white w-5 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateCartQty(item.id, 1)}
                              className="p-1 text-gray-400 hover:text-[#00B140]"
                            >
                              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>

                          {/* Price & Delete */}
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 w-full sm:w-auto shrink-0 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-0">
                            <div className="text-xs sm:text-sm font-bold font-mono text-[#00B140]">฿{(item.memberPrice * item.quantity).toLocaleString()}</div>
                            <button 
                              onClick={() => handleRemoveCartItem(item.id)}
                              className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition"
                              id={`remove-cart-item-${item.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Remarks input */}
                  <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-4 space-y-2">
                    <label className="text-xs font-bold text-gray-300">หมายเหตุถึงผู้ดูแลร้าน (ขนส่งที่ต้องการ/รายละเอียดเสริม)</label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="เช่น ขนส่งนิ่มเอ็กเพรส, ฝากส่งแกร็บด่วน, โทรแจ้งก่อนส่ง..."
                      rows={2}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00B140]"
                      id="cart-note-input"
                    />
                  </div>

                  {/* Delivery & Pickup Selector and preferred time */}
                  <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Truck className="w-4 h-4 text-[#00B140]" />
                      ตัวเลือกการรับสินค้า
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          deliveryType === 'delivery'
                            ? 'bg-[#00B140]/10 border-[#00B140] text-[#00B140]'
                            : 'bg-black border-white/10 text-gray-400 hover:text-white'
                        }`}
                        id="select-delivery-type"
                      >
                        <Car className="w-5 h-5" />
                        <span>จัดส่งแฟลช</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          deliveryType === 'pickup'
                            ? 'bg-[#00B140]/10 border-[#00B140] text-[#00B140]'
                            : 'bg-black border-white/10 text-gray-400 hover:text-white'
                        }`}
                        id="select-pickup-type"
                      >
                        <Store className="w-5 h-5" />
                        <span>รับเองหน้าร้าน</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300">
                        {deliveryType === 'delivery' ? 'ระบุเวลาที่ต้องการให้จัดส่งถึง:' : 'ระบุเวลาที่จะเข้ามารับสินค้าที่ร้าน:'}
                      </label>
                      <input
                        type="text"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        placeholder={deliveryType === 'delivery' ? 'เช่น วันนี้ก่อน 17:00 น., พรุ่งนี้ช่วงเช้า...' : 'เช่น วันนี้เวลา 15:30 น., วันเสาร์นี้...'}
                        className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00B140]"
                        id="delivery-time-input"
                      />
                    </div>
                  </div>

                  {/* Payment Method / Credit term selector */}
                  <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <ShieldCheck className="w-4 h-4 text-[#00B140]" />
                      วิธีการชำระเงิน (Payment Terms)
                    </h4>

                    <div className="space-y-3">
                      <label className="inline-flex items-center gap-3.5 p-3.5 bg-black/40 border border-white/5 rounded-xl w-full cursor-pointer hover:bg-black/60 transition duration-150">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                          className="w-4 h-4 accent-[#00B140]"
                        />
                        <div className="text-xs">
                          <div className="font-bold text-white">โอนเงินสด / ทันที (Cash / Bank Transfer)</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">ชำระเงินทันทีเพื่อความเร็วในการเตรียมและส่งของ</div>
                        </div>
                      </label>

                      {/* Credit Term Option - conditional for approved members */}
                      {currentUser.creditDays && currentUser.creditDays > 0 ? (
                        <div className="border border-[#00B140]/20 rounded-xl overflow-hidden bg-[#00B140]/5">
                          <label className="inline-flex items-center gap-3.5 p-3.5 w-full cursor-pointer">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === 'credit'}
                              onChange={() => setPaymentMethod('credit')}
                              className="w-4 h-4 accent-[#00B140]"
                            />
                            <div className="text-xs">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>ชำระด้วยวงเงินเครดิตคู่ค้า (Partner Credit)</span>
                                <span className="bg-[#00B140]/15 text-[#00B140] px-2 py-0.5 rounded text-[10px] border border-[#00B140]/25">
                                  อนุมัติแล้ว
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                คุณได้รับสิทธิ์เครดิตสูงสุด <span className="text-[#00B140] font-bold">{currentUser.creditDays} วัน</span> จากร้าน M Phone
                              </div>
                            </div>
                          </label>

                          {paymentMethod === 'credit' && (
                            <div className="bg-black/40 p-4 border-t border-white/5 space-y-3">
                              <label className="block text-[11px] font-bold text-gray-300">เลือกเทอมเครดิตสำหรับการสั่งซื้อนี้:</label>
                              <div className="flex gap-2">
                                {[7, 10, 30].map((days) => {
                                  // only allow days less than or equal to their approved creditDays
                                  const isAllowed = days <= (currentUser.creditDays || 0);
                                  if (!isAllowed) return null;

                                  const isSelected = creditDays === days;
                                  return (
                                    <button
                                      key={days}
                                      type="button"
                                      onClick={() => setCreditDays(days as 7 | 10 | 30)}
                                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition duration-150 cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#00B140] text-black border-transparent'
                                          : 'bg-black border-white/10 text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      เครดิต {days} วัน
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-500">
                          <div className="font-semibold text-gray-400">💳 ชำระด้วยวงเงินเครดิต (ไม่พร้อมใช้งาน)</div>
                          <p className="text-[10px] mt-1 text-gray-500">
                            *เฉพาะสมาชิกที่ได้รับการอนุมัติสิทธิ์เครดิต (7, 10, 30 วัน) จากผู้ดูแลระบบเท่านั้น
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary Panel */}
                <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 h-max">
                  <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b border-white/5 pb-2">สรุปรายการคำสั่งซื้อ</h3>
                  
                  <div className="space-y-2.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>ยอดจำนวนรวม:</span>
                      <span className="font-bold font-mono text-white">{cartItemCount} เครื่อง</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ค่าส่งพัสดุด่วน:</span>
                      <span className="font-bold font-semibold text-[#00B140]">฿0 (ส่งฟรี)</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-3.5">
                      <span className="text-emerald-400 font-bold">กำไรประมาณของท่าน:</span>
                      <span className="text-emerald-400 font-bold font-mono">+{cartTotalEstimatedProfit.toLocaleString()} บาท</span>
                    </div>
                  </div>

                  <div className="bg-[#00B140]/10 border border-[#00B140]/20 rounded-xl p-3.5">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">ยอดรวมที่ต้องชำระพาส่ง:</div>
                    <div className="text-xl font-bold font-mono text-[#00B140]">฿{cartTotal.toLocaleString()}</div>
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    className="w-full py-3.5 bg-[#00B140] hover:bg-[#009134] text-black font-extrabold rounded-xl text-xs tracking-wide shadow-lg shadow-[#00B140]/10 transition-all cursor-pointer"
                    id="cart-confirm-order-btn"
                  >
                    ยืนยันการสั่งซื้อ (ส่งออเดอร์)
                  </button>
                  <div className="text-[10px] text-gray-500 text-center font-medium">
                    *เมื่อกดส่งออเดอร์ ผู้ดูแลระบบจะตรวจสอบและดำเนินการแพ็คส่งต่อไป
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* --- 4. ORDERS HISTORY TAB --- */}
        {activeTab === 'orders' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="font-bold text-sm text-white uppercase tracking-wider mb-4">ประวัติคำสั่งซื้อและการติดตามสถานะ</h3>
            
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-[#1E1E1E]/30 rounded-2xl border border-white/5">
                <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium text-sm">ยังไม่มีคำสั่งซื้อของท่านในระบบขณะนี้</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, idx) => {
                  const itemsSummary = order.items.map(it => `${it.productName} x${it.quantity}`).join(', ');

                  return (
                    <motion.div 
                      key={order.id} 
                      className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5 space-y-4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                    >
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                        <div>
                          <span className="text-xs text-gray-500 font-bold uppercase">เลขออเดอร์อ้างอิง:</span>
                          <span className="ml-2 font-mono text-xs font-extrabold text-white">{order.id}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5">
                          <span className="text-[11px] text-gray-400 font-mono">
                            วันที่สั่ง: {new Date(order.createdAt).toLocaleDateString('th-TH')} {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="inline-flex items-center gap-1 py-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer text-[10px] font-bold transition duration-150"
                            id={`delete-order-btn-${order.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ยกเลิก/ลบออเดอร์
                          </button>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-3 items-center text-xs text-gray-300">
                            <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                            <div className="flex-1 truncate">
                              <div className="font-bold text-white truncate">{item.productName}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">สี: {item.color} | ความจำ: {item.storage}</div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-bold font-mono text-[#00B140]">฿{item.memberPrice.toLocaleString()}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">จำนวน x{item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary and current status tracking */}
                      <div className="bg-black/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border border-white/5">
                        <div>
                          <div className="text-gray-400">ราคารวม of order:</div>
                          <div className="text-base font-extrabold text-[#00B140] font-mono mt-0.5">฿{order.totalAmount.toLocaleString()}</div>
                        </div>

                        {/* Order status badges & stepper visual representation */}
                        <div className="flex items-center gap-1.5 font-bold uppercase">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] ${
                            order.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
                            order.status === 'preparing' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
                            order.status === 'shipped' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' :
                            order.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {order.status === 'pending' && '⏱ รออนุมัติ'}
                            {order.status === 'preparing' && '⚙ กำลังเตรียมสินค้า'}
                            {order.status === 'shipped' && (order.deliveryType === 'delivery' ? '🚗 กำลังจัดส่ง' : '🏪 รอรับหน้าร้าน')}
                            {order.status === 'completed' && '✓ สำเร็จเสร็จสิ้น'}
                            {order.status === 'canceled' && '❌ ยกเลิก'}
                          </span>
                        </div>
                      </div>

                      {/* Delivery & Payment details inside history card */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/40 p-4 rounded-xl text-xs border border-white/5">
                        <div>
                          <span className="text-gray-400">การรับสินค้า:</span>
                          <span className="block font-bold text-white mt-1">
                            {order.deliveryType === 'delivery' ? '🚚 จัดส่งแฟลช' : '🏪 มารับหน้าร้านด้วยตนเอง'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">เวลาจัดส่ง/รับของ:</span>
                          <span className="block font-bold text-gray-300 mt-1">
                            {order.deliveryTime || 'จัดส่งด่วนที่สุด'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">วิธีชำระเงิน:</span>
                          <span className="block font-bold text-[#00B140] mt-1">
                            {order.paymentMethod === 'credit' ? `💳 เครดิตพาร์ทเนอร์ ${order.creditDays} วัน` : '💵 โอนเงินสด / ทันที'}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Timeline progress bar */}
                      {order.status !== 'canceled' && (
                        <div className="relative pt-6 pb-2 px-4 bg-black/20 rounded-xl border border-white/5 mt-4">
                          {/* Stepper progress track */}
                          <div className="absolute top-[42px] left-12 right-12 h-1 bg-white/10 z-0 rounded-full overflow-hidden">
                            {/* Colored Active line */}
                            <div 
                              className="h-full bg-[#00B140] rounded-full transition-all duration-500"
                              style={{ 
                                width: order.status === 'pending' ? '0%' :
                                       order.status === 'preparing' ? '33.33%' :
                                       order.status === 'shipped' ? '66.66%' : '100%'
                              }}
                            ></div>
                          </div>

                          <div className="relative z-10 flex justify-between text-[10px] font-bold text-gray-400">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center w-20">
                              <div className={`w-9 h-9 rounded-full mb-2 flex items-center justify-center transition-all ${
                                ['pending', 'preparing', 'shipped', 'completed'].includes(order.status) 
                                  ? 'bg-[#00B140] text-black shadow-md shadow-[#00B140]/20' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                <ClipboardList className="w-4.5 h-4.5" />
                              </div>
                              <span className={['pending', 'preparing', 'shipped', 'completed'].includes(order.status) ? 'text-[#00B140]' : ''}>ส่งออเดอร์</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center w-20">
                              <div className={`w-9 h-9 rounded-full mb-2 flex items-center justify-center transition-all ${
                                ['preparing', 'shipped', 'completed'].includes(order.status) 
                                  ? 'bg-[#00B140] text-black shadow-md shadow-[#00B140]/20' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                <Package className="w-4.5 h-4.5" />
                              </div>
                              <span className={['preparing', 'shipped', 'completed'].includes(order.status) ? 'text-[#00B140]' : ''}>เตรียมแพ็ค</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center w-20">
                              <div className={`w-9 h-9 rounded-full mb-2 flex items-center justify-center transition-all ${
                                ['shipped', 'completed'].includes(order.status) 
                                  ? 'bg-[#00B140] text-black shadow-md shadow-[#00B140]/20' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                {order.deliveryType === 'delivery' ? (
                                  <Car className="w-4.5 h-4.5" />
                                ) : (
                                  <Store className="w-4.5 h-4.5" />
                                )}
                              </div>
                              <span className={['shipped', 'completed'].includes(order.status) ? 'text-[#00B140]' : ''}>
                                {order.deliveryType === 'delivery' ? 'จัดส่งแล้ว' : 'รอรับหน้าร้าน'}
                              </span>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center w-20">
                              <div className={`w-9 h-9 rounded-full mb-2 flex items-center justify-center transition-all ${
                                order.status === 'completed' 
                                  ? 'bg-[#00B140] text-black shadow-md shadow-[#00B140]/20' 
                                  : 'bg-gray-800 text-gray-400'
                              }`}>
                                <CheckCircle2 className="w-4.5 h-4.5" />
                              </div>
                              <span className={order.status === 'completed' ? 'text-[#00B140]' : ''}>
                                {order.deliveryType === 'delivery' ? 'จัดส่งสำเร็จ' : 'รับสินค้าแล้ว'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* --- 5. ACCOUNT TAB --- */}
        {activeTab === 'account' && (
          <motion.div className="space-y-6 max-w-md mx-auto" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Member Profile Details */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-[#00B140]/15 rounded-full flex items-center justify-center mx-auto text-[#00B140] border border-[#00B140]/20">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white">{currentUser.name}</h4>
                <p className="text-xs text-[#00B140] font-semibold mt-0.5">{currentUser.shopName}</p>
                <div className="inline-flex items-center gap-1 bg-white/5 text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-full mt-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00B140]" /> ได้รับการอนุมัติเข้าระบบแล้ว
                </div>
              </div>
            </div>

            {/* Account Metadata fields */}
            <div className="bg-[#1E1E1E] border border-white/5 rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" /> อีเมลในระบบ
                </span>
                <span className="font-semibold font-mono text-white">{currentUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" /> เบอร์โทรศัพท์
                </span>
                <span className="font-semibold font-mono text-white">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" /> ที่ตั้งร้านค้าของท่าน
                </span>
                <span className="font-semibold text-right text-gray-300 max-w-[200px] truncate" title={currentUser.shopName}>
                  {currentUser.shopName}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 text-red-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
              id="member-logout-btn"
            >
              <LogOut className="w-4 h-4" /> ออกจากระบบสมาชิก
            </button>
          </motion.div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION PANEL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/5 py-2.5 px-4 flex justify-between items-center z-40">
        <button 
          onClick={() => { setActiveTab('home'); setSelectedBrand(null); }}
          className={`flex flex-col items-center gap-1 cursor-pointer w-14 ${activeTab === 'home' ? 'text-[#00B140]' : 'text-gray-400'}`}
          id="mobile-tab-home"
        >
          <Grid className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">หน้าแรก</span>
        </button>

        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-14 ${activeTab === 'categories' ? 'text-[#00B140]' : 'text-gray-400'}`}
          id="mobile-tab-categories"
        >
          <Smartphone className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">หมวดหมู่</span>
        </button>

        <button 
          onClick={() => setActiveTab('cart')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-14 relative transition-all duration-350 ${
            cartBouncing ? 'scale-125 text-[#00B140]' : (activeTab === 'cart' ? 'text-[#00B140]' : 'text-gray-400')
          }`}
          id="mobile-tab-cart"
        >
          <ShoppingCart className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">ตะกร้า</span>
          {cartItemCount > 0 && (
            <span className="absolute top-0 right-2 bg-[#00B140] text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-black">
              {cartItemCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-14 relative ${activeTab === 'orders' ? 'text-[#00B140]' : 'text-gray-400'}`}
          id="mobile-tab-orders"
        >
          <ClipboardList className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">สั่งซื้อ</span>
          {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
            <span className="absolute top-0 right-2 bg-yellow-400 text-black font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-black">
              {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-1 cursor-pointer w-14 ${activeTab === 'account' ? 'text-[#00B140]' : 'text-gray-400'}`}
          id="mobile-tab-account"
        >
          <User className="w-5.5 h-5.5" />
          <span className="text-[9px] font-bold">บัญชี</span>
        </button>
      </div>

      {/* --- MEMBER PRODUCT DETAILS DIALOG MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-[#1E1E1E] border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl relative my-8"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 bg-black/40 hover:bg-black/80 rounded-full cursor-pointer z-20"
              id="close-detail-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-4">
              {/* Left Column: Image Gallery & Thumbnails */}
              <div className="space-y-4">
                {/* Main Large Image Display with Zoom capability */}
                <div 
                  className="relative h-64 sm:h-80 bg-black/40 rounded-2xl flex items-center justify-center overflow-hidden border border-white/5 group cursor-zoom-in"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <img 
                    src={selectedProduct.images[activeImgIndex]} 
                    alt={selectedProduct.name} 
                    className={`object-cover w-full h-full transition-transform duration-300 ${isZoomed ? 'scale-150' : 'group-hover:scale-105'}`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 right-3 p-2 bg-black/60 rounded-xl text-gray-400 group-hover:text-white transition duration-150 pointer-events-none">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Thumbnails list */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto py-1">
                    {selectedProduct.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setActiveImgIndex(idx); setIsZoomed(false); }}
                        className={`w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition ${
                          activeImgIndex === idx ? 'border-[#00B140] ring-1 ring-[#00B140]' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Selections, details, and Pricing */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-[#00B140] bg-[#00B140]/10 border border-[#00B140]/25 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {selectedProduct.brand} ORIGINAL PRODUCT
                  </span>
                  <h3 className="font-bold text-xl text-white tracking-tight mt-3">{selectedProduct.name}</h3>
                  <p className="text-gray-400 text-xs mt-1.5 font-medium">รุ่นหลัก: {selectedProduct.model}</p>
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">{selectedProduct.description}</p>

                  {/* Circle Color Selectors */}
                  <div className="mt-5 space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">เลือกสีตัวเครื่อง:</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(selectedProduct.variants.map(v => v.color))).map((col) => {
                        const isSelected = detailColor === col;
                        return (
                          <button
                            key={col}
                            onClick={() => {
                              setDetailColor(col);
                              // Auto sync storage options if needed
                              const firstValid = selectedProduct.variants.find(v => v.color === col);
                              if (firstValid) setDetailStorage(firstValid.storage);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                              isSelected ? 'bg-[#00B140] text-black border-transparent font-bold' : 'bg-black border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                            }`}
                            id={`color-select-${col}`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chip Storage Selectors */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">เลือกความจุหน่วยความจำ:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variants
                        .filter(v => v.color === detailColor)
                        .map((v) => {
                          const isSelected = detailStorage === v.storage;
                          return (
                            <button
                              key={v.storage}
                              onClick={() => setDetailStorage(v.storage)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                                isSelected ? 'bg-[#00B140] text-black border-transparent font-bold' : 'bg-black border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                              }`}
                              id={`storage-select-${v.storage}`}
                            >
                              {v.storage}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Quantity and Prices */}
                  {(() => {
                    const variant = getSelectedVariant(selectedProduct);
                    if (!variant) return null;
                    const profit = variant.retailPrice - variant.memberPrice;

                    return (
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div>
                              <span className="text-[10px] text-gray-500 font-bold uppercase">ราคาขายปลีกแนะนำ:</span>
                              <div className="text-sm font-semibold text-gray-400 font-mono mt-0.5">฿{variant.retailPrice.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-500 font-bold uppercase">ราคาดีลเลอร์สมาชิก:</span>
                              <div className="text-xl font-black text-[#00B140] font-mono mt-0.5">฿{variant.memberPrice.toLocaleString()}</div>
                            </div>
                          </div>

                          {/* Estimated Profit badge */}
                          <div className="bg-[#00B140]/10 border border-[#00B140]/20 rounded-xl p-3 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-300">กำไรโดยประมาณ:</span>
                              <span className="text-sm font-extrabold text-[#00B140] font-mono">+{profit.toLocaleString()} Baht</span>
                            </div>
                            <div className="text-[10px] text-gray-500 text-right">
                              (คำนวณจาก: ราคาขายปลีกแนะนำ RRP ฿{variant.retailPrice.toLocaleString()} - ราคาดีลเลอร์ ฿{variant.memberPrice.toLocaleString()})
                            </div>
                          </div>
                        </div>

                        {/* Quantity selection */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">เลือกจำนวนสั่งพ่วง (Quantity):</span>
                          <div className="flex items-center gap-4 bg-black border border-white/10 rounded-xl px-2.5 py-1.5">
                            <button 
                              type="button"
                              onClick={() => setDetailQty(prev => prev > 1 ? prev - 1 : 1)}
                              className="p-1 hover:text-[#00B140]"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold font-mono text-white w-8 text-center">{detailQty}</span>
                            <button 
                              type="button"
                              onClick={() => setDetailQty(prev => prev + 1)}
                              className="p-1 hover:text-[#00B140]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Freebies & Specs detail list accordion */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] text-gray-400">
                  {selectedProduct.freebies.length > 0 && (
                    <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-white font-bold flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5 text-[#00B140]" /> แถมฟรีชุดกิฟต์:
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                        {selectedProduct.freebies.map((fr, idx) => (
                          <li key={idx} className="truncate">{fr}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedProduct.specifications.length > 0 && (
                    <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-white font-bold flex items-center gap-1">
                        <ListTodo className="w-3.5 h-3.5 text-[#00B140]" /> ข้อมูลสเปกเครื่อง:
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[10px]">
                        {selectedProduct.specifications.map((sp, idx) => (
                          <li key={idx} className="whitespace-normal break-words inline-block w-full">{sp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(selectedProduct, undefined, e)}
                    className="flex-1 py-3.5 bg-[#00B140] hover:bg-[#009134] text-black font-extrabold rounded-xl text-xs tracking-wide shadow-lg shadow-[#00B140]/10 transition-all cursor-pointer"
                    id="add-to-cart-modal-btn"
                  >
                    ใส่ตะกร้าสินค้า
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleAddToCart(selectedProduct, undefined, e);
                      setActiveTab('cart');
                    }}
                    className="py-3.5 px-6 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition cursor-pointer"
                    id="buy-now-modal-btn"
                  >
                    สั่งซื้อทันที
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* PWA INSTALL / DOWNLOAD INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#141414] border border-[#222] rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header with App Logo */}
              <div className="p-6 bg-gradient-to-b from-[#1E1E1E] to-[#141414] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center shadow shadow-[#00B140]/10 shrink-0">
                    <img 
                      src="/src/assets/images/app_logo_1784278041449.jpg" 
                      alt="M Phone Shop Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">ติดตั้งแอปพลิเคชัน M PHONE SHOP</h3>
                    <p className="text-[10px] text-gray-500 font-semibold tracking-wider">INSTALLED AS PROGRESSIVE WEB APP</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition cursor-pointer animate-none"
                  id="close-install-modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps Body */}
              <div className="p-6 space-y-6 text-sm">
                <p className="text-gray-400 text-xs leading-relaxed">คุณสามารถติดตั้งเว็บพอร์ทัลนี้ให้กลายเป็นแอปพลิเคชันเสมือนจริงบนมือถือ เพื่อให้กดเข้าใช้งานจากหน้าจอหลักได้โดยตรง สะดวก ไม่เปลืองเน็ต และได้รับการแจ้งเตือนสถานะทันที!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* iOS Instructions */}
                  <div className="bg-[#1C1C1E] rounded-xl p-4.5 border border-white/5 space-y-3.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="w-5.5 h-5.5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">iOS</span>
                      <span className="font-bold text-xs text-white">ขั้นตอนบน iPhone / iPad</span>
                    </div>
                    <ul className="space-y-3 text-xs text-gray-300">
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">1.</span>
                        <span>เปิดเว็บพอร์ทัลนี้ด้วยเบราว์เซอร์ <strong className="text-white">Safari</strong> เท่านั้น</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">2.</span>
                        <span className="flex items-center flex-wrap gap-1">กดที่ปุ่ม <strong className="text-white">แชร์ (Share)</strong> <Share2 className="w-3.5 h-3.5 text-blue-400 inline mx-0.5" /> บริเวณแถบเมนูด้านล่าง</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">3.</span>
                        <span>เลื่อนหาและเลือกเมนู <strong className="text-white">"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">4.</span>
                        <span>ตรวจสอบชื่อแอปและกดปุ่ม <strong className="text-[#00B140]">"เพิ่ม" (Add)</strong> ด้านขวาบน</span>
                      </li>
                    </ul>
                  </div>

                  {/* Android Instructions */}
                  <div className="bg-[#1C1C1E] rounded-xl p-4.5 border border-white/5 space-y-3.5">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <span className="w-5.5 h-5.5 rounded-full bg-green-500/10 text-[#00B140] flex items-center justify-center font-bold text-xs">And</span>
                      <span className="font-bold text-xs text-white">ขั้นตอนบน Android / Chrome</span>
                    </div>
                    <ul className="space-y-3 text-xs text-gray-300">
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">1.</span>
                        <span>เปิดด้วยเบราว์เซอร์ <strong className="text-white">Chrome</strong> หรืออินเทอร์เน็ตเบราว์เซอร์</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">2.</span>
                        <span className="flex items-center flex-wrap gap-1">กดที่ปุ่มตัวเลือก <strong className="text-white">เมนู 3 จุด</strong> <Grid className="w-3.5 h-3.5 text-gray-400 inline mx-0.5" /> ที่มุมบนขวา</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">3.</span>
                        <span>เลือกคำสั่ง <strong className="text-white">"ติดตั้งแอป" (Install App)</strong> หรือ <strong className="text-white">"เพิ่มไปยังหน้าจอหลัก"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-[#00B140] font-bold">4.</span>
                        <span>กดคำสั่ง <strong className="text-[#00B140]">"ติดตั้ง" (Install)</strong> เพื่อยืนยันการเพิ่มแอป</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Icon Download Action */}
                <div className="bg-[#1E1E1E]/45 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-xs text-white">ต้องการเซฟรูปภาพไอคอนแอปพลิเคชัน?</h4>
                    <p className="text-[10px] text-gray-500">บันทึกรูปโลโก้ต้นฉบับคุณภาพสูงเพื่อจัดเตรียมภาพหรือใช้งานดีลเลอร์</p>
                  </div>
                  <a 
                    href="/src/assets/images/app_logo_1784278041449.jpg" 
                    download="mphone_shop_app_icon.jpg"
                    className="px-4 py-2 bg-[#00B140] hover:bg-[#009134] text-black font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> บันทึกรูปภาพ
                  </a>
                </div>
              </div>

              {/* Modal Action footer */}
              <div className="p-4 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button 
                  onClick={() => {
                    localStorage.setItem('mphone_app_downloaded', 'true');
                    setShowAppCard(false);
                    setShowInstallModal(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#00B140]/10 hover:bg-[#00B140]/20 text-[#00B140] border border-[#00B140]/20 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  ติดตั้งสำเร็จแล้ว (ซ่อนคำแนะนำนี้)
                </button>
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white font-semibold transition cursor-pointer border border-white/5 text-center"
                >
                  เข้าใจแล้ว, ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Selected Announcement Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#141414] border border-[#222] rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-b from-[#1E1E1E] to-[#141414] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    selectedAnnouncement.type === 'promo' ? 'bg-amber-500/10 text-amber-500' :
                    selectedAnnouncement.type === 'alert' ? 'bg-red-500/10 text-red-500' :
                    selectedAnnouncement.type === 'news' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-[#00B140]/10 text-[#00B140]'
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                      {new Date(selectedAnnouncement.createdAt).toLocaleDateString('th-TH', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })} น.
                    </span>
                    <h3 className="font-bold text-sm text-white">รายละเอียดประกาศข่าวสาร</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedAnnouncement.type === 'promo' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    selectedAnnouncement.type === 'alert' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                    selectedAnnouncement.type === 'news' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                    'bg-emerald-500/10 text-[#00B140] border border-[#00B140]/20'
                  }`}>
                    {selectedAnnouncement.type === 'promo' ? 'โปรโมชั่นพิเศษ' :
                     selectedAnnouncement.type === 'alert' ? 'ประกาศด่วนที่สุด' :
                     selectedAnnouncement.type === 'news' ? 'ประกาศข่าวสาร' : 'ข้อมูลทั่วไป'}
                  </span>
                  <h4 className="font-bold text-lg text-white leading-snug">{selectedAnnouncement.title}</h4>
                </div>
                
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  รับทราบประกาศ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1C1C1E] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <Trash2 className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">{deleteConfirm.title}</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{deleteConfirm.message}</p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirm.onConfirm();
                    setDeleteConfirm(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flying Cart Items Animation */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              position: 'fixed',
              left: item.startX - 24,
              top: item.startY - 24,
              width: 48,
              height: 48,
              borderRadius: '9999px',
              border: '2px solid #00B140',
              boxShadow: '0 0 20px rgba(0, 177, 64, 0.6)',
              overflow: 'hidden',
              zIndex: 9999,
              pointerEvents: 'none',
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: [item.startX - 24, (item.startX + item.endX) / 2, item.endX - 12],
              top: [item.startY - 24, Math.min(item.startY, item.endY) - 120, item.endY - 12],
              scale: [1, 1.4, 0.15],
              opacity: [1, 1, 0.7],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 0.9,
              ease: [0.25, 1, 0.5, 1],
            }}
            onAnimationComplete={() => {
              setFlyingItems((prev) => prev.filter((f) => f.id !== item.id));
              setCartBouncing(true);
              setTimeout(() => setCartBouncing(false), 500);
            }}
          >
            <img
              src={item.image}
              alt="flying product"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Gorgeous Custom Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 md:bottom-8 right-4 left-4 md:left-auto md:right-8 z-[9999] max-w-sm"
          >
            <div className="bg-[#1C1C1E]/95 backdrop-blur-xl border border-[#00B140]/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 ring-1 ring-black/40">
              <div className="p-2 bg-[#00B140]/10 text-[#00B140] rounded-xl shrink-0 shadow-inner">
                <ShoppingCart className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">สำเร็จ!</p>
                <p className="text-white text-xs font-semibold leading-relaxed line-clamp-2">{toastMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
