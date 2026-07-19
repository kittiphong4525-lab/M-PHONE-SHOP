import React, { useState, useEffect, useRef } from 'react';
import { MPhoneDatabase } from '../lib/db';
import { Product, Member, Order, PromoBanner, ProductVariant, OrderStatus, Announcement } from '../types';
import { 
  LayoutDashboard, ShoppingBag, Users, ShoppingCart, Image as ImageIcon, 
  Settings, LogOut, Plus, Search, Edit2, Trash2, Check, X, ShieldAlert,
  TrendingUp, CircleDollarSign, PlusCircle, RefreshCw, Layers, CheckCircle2,
  Package, Clock, Truck, Ban, ChevronRight, Eye, EyeOff, Paperclip,
  Sun, Moon, Menu, Megaphone, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

interface AdminPanelProps {
  currentUser: Member;
  onLogout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

type AdminTab = 'dashboard' | 'products' | 'members' | 'orders' | 'banners' | 'announcements' | 'settings';

export default function AdminPanel({ currentUser, onLogout, theme, toggleTheme }: AdminPanelProps) {
  const { success, error, warning, info } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Announcements Modals & Forms State
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'info' | 'promo' | 'alert' | 'news'>('info');

  // Modals / Forms State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  
  // Product Form Sub-states
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Apple');
  const [prodModel, setProdModel] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSpecs, setProdSpecs] = useState<string[]>(['']);
  const [prodFreebies, setProdFreebies] = useState<string[]>(['']);
  const [prodImages, setProdImages] = useState<string[]>(['']);
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([
    { id: 'v_temp_1', color: 'Black', storage: '128GB', costPrice: 0, memberPrice: 0, retailPrice: 0 }
  ]);
  const [prodActive, setProdActive] = useState(true);

  // Member Form Sub-states
  const [memName, setMemName] = useState('');
  const [memEmail, setMemEmail] = useState('');
  const [memPhone, setMemPhone] = useState('');
  const [memShop, setMemShop] = useState('');
  const [memActive, setMemActive] = useState(true);
  const [memRole, setMemRole] = useState<'admin' | 'member'>('member');
  const [memPassword, setMemPassword] = useState(''); // Simulated password setup/reset
  const [memCreditDays, setMemCreditDays] = useState<0 | 7 | 10 | 30>(0);

  // Banner Form Sub-states
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [bannerActive, setBannerActive] = useState(true);

  // Selected Order for viewing details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast notifications for new orders
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Dynamic categories state
  const [categories, setCategories] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState('');

  // Sound settings state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mphone_sound_enabled') !== 'false';
  });
  const [soundType, setSoundType] = useState<string>(() => {
    return localStorage.getItem('mphone_sound_type') || 'bell';
  });
  const [soundUrl, setSoundUrl] = useState<string>(() => {
    return localStorage.getItem('mphone_sound_url') || '';
  });

  // Load data and subscribe to real-time updates
  useEffect(() => {
    fetchData();
    const unsubscribe = MPhoneDatabase.subscribe(() => {
      fetchData();
    });
    return () => unsubscribe();
  }, []);

  const fetchData = () => {
    setProducts(MPhoneDatabase.getProducts());
    setMembers(MPhoneDatabase.getMembers());
    setOrders(MPhoneDatabase.getOrders());
    setBanners(MPhoneDatabase.getBanners());
    setCategories(MPhoneDatabase.getCategories());
    setAnnouncements(MPhoneDatabase.getAnnouncements());
  };

  // Synthesize notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    if (soundType === 'custom' && soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        audio.play().catch(e => console.log('Audio playback blocked or failed', e));
      } catch (err) {
        console.error('Custom audio failed, falling back', err);
        synthesizeSound('bell');
      }
    } else {
      synthesizeSound(soundType);
    }
  };

  const synthesizeSound = (type: string) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'bell') {
        const playTone = (time: number, freq: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.5, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
          
          osc.start(time);
          osc.stop(time + duration);
        };
        
        const now = ctx.currentTime;
        playTone(now, 880, 0.5); // A5
        playTone(now + 0.12, 1109, 0.7); // C#6
      } else if (type === 'beep') {
        const now = ctx.currentTime;
        const playBeep = (time: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(1400, time);
          
          gain.gain.setValueAtTime(0.15, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
          
          osc.start(time);
          osc.stop(time + 0.09);
        };
        playBeep(now);
        playBeep(now + 0.1);
        playBeep(now + 0.2);
      } else if (type === 'fantasy') {
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          
          gain.gain.setValueAtTime(0.25, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      } else if (type === 'siren') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        const now = ctx.currentTime;
        
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(750, now + 0.25);
        osc.frequency.linearRampToValueAtTime(350, now + 0.5);
        osc.frequency.linearRampToValueAtTime(750, now + 0.75);
        osc.frequency.linearRampToValueAtTime(350, now + 1.0);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.2, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
        
        osc.start(now);
        osc.stop(now + 1.1);
      }
    } catch (e) {
      console.error('Audio synthesis failed', e);
    }
  };

  const prevOrdersCountRef = useRef<number>(0);

  // Initialize previous count ref once on first load of orders
  useEffect(() => {
    if (orders.length > 0 && prevOrdersCountRef.current === 0) {
      prevOrdersCountRef.current = orders.length;
    }
  }, [orders]);

  // Real-time sound/toast triggers for new orders
  useEffect(() => {
    if (prevOrdersCountRef.current > 0 && orders.length > prevOrdersCountRef.current) {
      const newCount = orders.length - prevOrdersCountRef.current;
      setToastMessage(`🔔 มีคำสั่งซื้อใหม่ ${newCount} รายการ!`);
      
      const enabled = localStorage.getItem('mphone_sound_enabled') !== 'false';
      if (enabled) {
        const type = localStorage.getItem('mphone_sound_type') || 'bell';
        const url = localStorage.getItem('mphone_sound_url') || '';
        if (type === 'custom' && url) {
          try {
            const audio = new Audio(url);
            audio.play().catch(e => console.log('Audio blocked', e));
          } catch {
            synthesizeSound('bell');
          }
        } else {
          synthesizeSound(type);
        }
      }
      setTimeout(() => setToastMessage(null), 8000);
    }
    if (orders.length > 0) {
      prevOrdersCountRef.current = orders.length;
    }
  }, [orders.length]);

  // --- CATEGORY CRUD HANDLERS ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    const updated = MPhoneDatabase.addCategory(name);
    setCategories(updated);
    setNewCatName('');
    success(`เพิ่มหมวดหมู่ยี่ห้อ "${name}" เรียบร้อยแล้ว`, 'สำเร็จ');
  };

  const handleDeleteCategory = (cat: string) => {
    setDeleteConfirm({
      title: 'ยืนยันการลบหมวดหมู่ยี่ห้อ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ยี่ห้อ "${cat}"? สินค้าในหมวดหมู่นี้จะไม่ถูกลบ แต่จะไม่ถูกจัดกลุ่มในหมวดหมู่นี้`,
      onConfirm: () => {
        const updated = MPhoneDatabase.deleteCategory(cat);
        setCategories(updated);
        success(`ลบหมวดหมู่ยี่ห้อ "${cat}" เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  // --- SOUND SETTINGS HANDLERS ---
  const handleSaveSoundSettings = () => {
    localStorage.setItem('mphone_sound_enabled', String(soundEnabled));
    localStorage.setItem('mphone_sound_type', soundType);
    localStorage.setItem('mphone_sound_url', soundUrl);
    success('บันทึกค่าระบบเสียงแจ้งเตือนเรียบร้อยแล้ว!', 'สำเร็จ');
  };

  const handleTestSound = () => {
    const oldEnabled = localStorage.getItem('mphone_sound_enabled');
    const oldType = localStorage.getItem('mphone_sound_type');
    const oldUrl = localStorage.getItem('mphone_sound_url');

    localStorage.setItem('mphone_sound_enabled', 'true');
    localStorage.setItem('mphone_sound_type', soundType);
    localStorage.setItem('mphone_sound_url', soundUrl);

    if (soundType === 'custom' && soundUrl) {
      try {
        const audio = new Audio(soundUrl);
        audio.play().catch(e => {
          console.log('Audio blocked', e);
          synthesizeSound('bell');
        });
      } catch {
        synthesizeSound('bell');
      }
    } else {
      synthesizeSound(soundType);
    }

    if (oldEnabled !== null) localStorage.setItem('mphone_sound_enabled', oldEnabled);
    if (oldType !== null) localStorage.setItem('mphone_sound_type', oldType);
    if (oldUrl !== null) localStorage.setItem('mphone_sound_url', oldUrl);
  };

  // Stats calculations
  const totalSales = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  
  const pendingSales = orders
    .filter(o => o.status !== 'completed' && o.status !== 'canceled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // --- PRODUCT CRUD ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdBrand('Apple');
    setProdModel('');
    setProdDesc('');
    setProdSpecs(['']);
    setProdFreebies(['']);
    setProdImages(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80']);
    setProdVariants([{ id: 'v_init_' + Date.now(), color: 'Black', storage: '128GB', costPrice: 20000, memberPrice: 22000, retailPrice: 24900 }]);
    setProdActive(true);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdBrand(prod.brand);
    setProdModel(prod.model);
    setProdDesc(prod.description);
    setProdSpecs(prod.specifications.length > 0 ? prod.specifications : ['']);
    setProdFreebies(prod.freebies.length > 0 ? prod.freebies : ['']);
    setProdImages(prod.images.length > 0 ? prod.images : ['']);
    setProdVariants(prod.variants);
    setProdActive(prod.active);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodModel) {
      error('กรุณากรอกชื่อสินค้าและรุ่นสินค้า', 'ข้อมูลไม่ครบถ้วน');
      return;
    }

    const cleanSpecs = prodSpecs.filter(s => s.trim() !== '');
    const cleanFreebies = prodFreebies.filter(f => f.trim() !== '');
    const cleanImages = prodImages.filter(img => img.trim() !== '');

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'p_' + Date.now(),
      name: prodName,
      brand: prodBrand,
      model: prodModel,
      description: prodDesc,
      specifications: cleanSpecs.length > 0 ? cleanSpecs : ['ไม่มีรายละเอียดสเปกเพิ่มเติม'],
      freebies: cleanFreebies,
      images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
      variants: prodVariants.map((v, idx) => ({
        ...v,
        id: v.id.startsWith('v_') ? v.id : `v_${Date.now()}_${idx}`
      })),
      active: prodActive,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    MPhoneDatabase.saveProduct(productData);
    setIsProductModalOpen(false);
    fetchData();
    success(`บันทึกข้อมูลสินค้า "${prodName}" เรียบร้อยแล้ว`, 'สำเร็จ');
  };

  const handleDeleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    const prodNameDisplay = prod ? ` "${prod.name}"` : '';
    setDeleteConfirm({
      title: 'ยืนยันการลบสินค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า${prodNameDisplay}นี้ออกจากระบบอย่างถาวร?`,
      onConfirm: () => {
        MPhoneDatabase.deleteProduct(id);
        fetchData();
        success(`ลบสินค้า${prodNameDisplay} เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  // Product helper functions for arrays in form
  const handleAddSpec = () => setProdSpecs([...prodSpecs, '']);
  const handleUpdateSpec = (val: string, index: number) => {
    const updated = [...prodSpecs];
    updated[index] = val;
    setProdSpecs(updated);
  };
  const handleRemoveSpec = (index: number) => {
    setProdSpecs(prodSpecs.filter((_, i) => i !== index));
  };

  const handleAddFreebie = () => setProdFreebies([...prodFreebies, '']);
  const handleUpdateFreebie = (val: string, index: number) => {
    const updated = [...prodFreebies];
    updated[index] = val;
    setProdFreebies(updated);
  };
  const handleRemoveFreebie = (index: number) => {
    setProdFreebies(prodFreebies.filter((_, i) => i !== index));
  };

  const handleAddImage = () => setProdImages([...prodImages, '']);
  const handleUpdateImage = (val: string, index: number) => {
    const updated = [...prodImages];
    updated[index] = val;
    setProdImages(updated);
  };
  const handleRemoveImage = (index: number) => {
    setProdImages(prodImages.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setProdVariants([
      ...prodVariants, 
      { id: 'v_new_' + Date.now() + Math.random(), color: 'Black', storage: '128GB', costPrice: 0, memberPrice: 0, retailPrice: 0 }
    ]);
  };
  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...prodVariants];
    updated[index] = {
      ...updated[index],
      [field]: field === 'costPrice' || field === 'memberPrice' || field === 'retailPrice' ? Number(val) : val
    };
    setProdVariants(updated);
  };
  const handleRemoveVariant = (index: number) => {
    if (prodVariants.length <= 1) {
      alert('สินค้าต้องมีอย่างน้อย 1 สี/ความจำ');
      return;
    }
    setProdVariants(prodVariants.filter((_, i) => i !== index));
  };

  // --- MEMBER CRUD ---
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemName('');
    setMemEmail('');
    setMemPhone('');
    setMemShop('');
    setMemActive(true);
    setMemRole('member');
    setMemPassword('');
    setMemCreditDays(0);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (mem: Member) => {
    setEditingMember(mem);
    setMemName(mem.name || '');
    setMemEmail(mem.email || '');
    setMemPhone(mem.phone || '');
    setMemShop(mem.shopName || '');
    setMemActive(mem.active ?? true);
    setMemRole(mem.role || 'member');
    setMemPassword(''); // Hide current password, only change if entered
    setMemCreditDays(mem.creditDays || 0);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName || !memEmail || !memShop) {
      error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'ข้อมูลไม่ครบถ้วน');
      return;
    }

    const memberData: Member = {
      id: editingMember ? editingMember.id : 'm_' + Date.now(),
      name: memName,
      email: memEmail.trim(),
      phone: memPhone,
      shopName: memShop,
      active: memActive,
      role: memRole,
      creditDays: memCreditDays,
      createdAt: editingMember ? editingMember.createdAt : new Date().toISOString(),
      password: memPassword ? memPassword : (editingMember ? editingMember.password : '123456')
    };

    MPhoneDatabase.saveMember(memberData);
    setIsMemberModalOpen(false);
    fetchData();
    success(`บันทึกข้อมูลสมาชิก "${memName}" เรียบร้อยแล้ว`, 'สำเร็จ');
  };

  const handleDeleteMember = (id: string) => {
    if (id === 'm_admin') {
      warning('ไม่สามารถลบผู้ดูแลหลักระบบได้', 'ข้อผิดพลาด');
      return;
    }
    const mem = members.find(m => m.id === id);
    const memNameDisplay = mem ? ` "${mem.name}"` : '';
    setDeleteConfirm({
      title: 'ยืนยันการลบร้านค้า/ลูกค้า',
      message: `คุณแน่ใจหรือไม่ว่าต้องการยกเลิกหรือลบร้านค้า/ลูกค้า${memNameDisplay}ออกจากเครือข่ายอย่างถาวร?`,
      onConfirm: () => {
        MPhoneDatabase.deleteMember(id);
        fetchData();
        success(`ลบข้อมูลสมาชิก${memNameDisplay} เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  const handleResetPassword = (mem: Member) => {
    const newPass = prompt(`ตั้งค่ารหัสผ่านใหม่สำหรับคุณ ${mem.name} (ค่าเริ่มต้นแนะนำคือ 123456):`, mem.password || '123456');
    if (newPass !== null) {
      if (newPass.trim().length < 4) {
        error('รหัสผ่านควรมีความยาวอย่างน้อย 4 ตัวอักษร', 'รหัสผ่านสั้นเกินไป');
        return;
      }
      const updated = { ...mem, password: newPass.trim() };
      MPhoneDatabase.saveMember(updated);
      success(`รีเซ็ตรหัสผ่านสำหรับลูกค้า ${mem.name} สำเร็จแล้ว (รหัสผ่านใหม่คือ: ${newPass.trim()})`, 'สำเร็จ');
      fetchData();
    }
  };

  // --- ORDER STATUS CHANGE ---
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    MPhoneDatabase.updateOrderStatus(orderId, status);
    fetchData();
    // Update active modal order view to reflect state
    if (selectedOrder && selectedOrder.id === orderId) {
      const updated = MPhoneDatabase.getOrders().find(o => o.id === orderId);
      if (updated) setSelectedOrder(updated);
    }
    success(`อัปเดตสถานะคำสั่งซื้อ #${orderId} เป็น "${status}" เรียบร้อยแล้ว`, 'อัปเดตสถานะสำเร็จ');
  };

  // --- BANNER CRUD ---
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerImg('https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1200&auto=format&fit=crop&q=80');
    setBannerActive(true);
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImg) {
      error('กรุณากรอกชื่อแบนเนอร์และลิงก์รูปภาพ', 'ข้อมูลไม่ครบถ้วน');
      return;
    }

    const bannerData: PromoBanner = {
      id: editingBanner ? editingBanner.id : 'b_' + Date.now(),
      title: bannerTitle,
      imageUrl: bannerImg,
      active: bannerActive
    };

    MPhoneDatabase.saveBanner(bannerData);
    setIsBannerModalOpen(false);
    fetchData();
    success(`บันทึกแบนเนอร์โปรโมชัน "${bannerTitle}" เรียบร้อยแล้ว`, 'สำเร็จ');
  };

  const handleDeleteBanner = (id: string) => {
    const banner = banners.find(b => b.id === id);
    const bannerTitleDisplay = banner ? ` "${banner.title}"` : '';
    setDeleteConfirm({
      title: 'ยืนยันการลบแบนเนอร์',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบแบนเนอร์${bannerTitleDisplay}นี้ออกจากระบบอย่างถาวร?`,
      onConfirm: () => {
        MPhoneDatabase.deleteBanner(id);
        fetchData();
        success(`ลบแบนเนอร์โปรโมชัน${bannerTitleDisplay} เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  const handleDeleteOrder = (id: string) => {
    setDeleteConfirm({
      title: 'ยืนยันการลบคำสั่งซื้อ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อหมายเลข "${id}" นี้ออกจากระบบอย่างถาวร? การลบนี้ไม่สามารถย้อนกลับได้`,
      onConfirm: () => {
        MPhoneDatabase.deleteOrder(id);
        fetchData();
        success(`ลบคำสั่งซื้อหมายเลข "${id}" เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  // --- ANNOUNCEMENT CRUD ---
  const handleOpenAddAnnouncement = () => {
    setEditingAnn(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnType('info');
    setIsAnnModalOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnType(ann.type);
    setIsAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      error('กรุณากรอกหัวข้อและเนื้อหาประกาศ', 'ข้อมูลไม่ครบถ้วน');
      return;
    }

    const annData: Announcement = {
      id: editingAnn ? editingAnn.id : 'ann_' + Date.now(),
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      createdAt: editingAnn ? editingAnn.createdAt : new Date().toISOString(),
      active: editingAnn ? editingAnn.active : true
    };

    await MPhoneDatabase.saveAnnouncement(annData);
    setIsAnnModalOpen(false);
    fetchData();
    success(`บันทึกประกาศ "${annTitle.trim()}" เรียบร้อยแล้ว`, 'สำเร็จ');
  };

  const handleDeleteAnnouncement = (id: string) => {
    const ann = announcements.find(a => a.id === id);
    const annTitleDisplay = ann ? ` "${ann.title}"` : '';
    setDeleteConfirm({
      title: 'ยืนยันการลบประกาศ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบประกาศ${annTitleDisplay}นี้ออกจากระบบอย่างถาวร?`,
      onConfirm: async () => {
        await MPhoneDatabase.deleteAnnouncement(id);
        fetchData();
        success(`ลบประกาศ${annTitleDisplay} เรียบร้อยแล้ว`, 'สำเร็จ');
      }
    });
  };

  // Filters
  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (p.brand || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (p.model || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const filteredMembers = members.filter(m => 
    (m.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (m.shopName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (m.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (m.phone || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    (o.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (o.memberName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (o.memberShopName || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col md:flex-row relative overflow-x-hidden">
      {/* Toast Notification for new orders */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#00B140] text-black font-extrabold text-xs px-5 py-3.5 rounded-2xl shadow-2xl shadow-[#00B140]/20 flex items-center gap-3 z-[9999] border border-white/10 min-w-[300px] justify-between cursor-pointer"
            onClick={() => { setToastMessage(null); setActiveTab('orders'); }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base animate-bounce">🛎️</span>
              <div className="text-left">
                <div className="font-black text-black">คำสั่งซื้อใหม่เข้ามา!</div>
                <div className="text-[10px] font-bold text-black/85 mt-0.5">{toastMessage}</div>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setToastMessage(null); }}
              className="text-black/60 hover:text-black font-bold text-[10px] bg-black/10 hover:bg-black/20 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-all shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#111111]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00B140] to-[#00ff5d] flex items-center justify-center shadow-md shadow-[#00B140]/10">
            <ShoppingBag className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">M PHONE <span className="text-[#00B140]">SHOP</span></h2>
            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">แผงควบคุมแอดมิน</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition text-gray-300 cursor-pointer"
          id="toggle-sidebar-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* SIDEBAR BACKDROP FOR MOBILE */}
      <div 
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] border-r border-white/10 p-6 flex flex-col shrink-0 transition-transform duration-300 transform md:relative md:translate-x-0 md:bg-black/40 md:border-b-0 md:border-r md:p-6 md:h-screen md:sticky md:top-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00B140] to-[#00ff5d] flex items-center justify-center shadow-lg shadow-[#00B140]/10">
              <ShoppingBag className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-wide">M PHONE <span className="text-[#00B140]">SHOP</span></h2>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">แผงควบคุมแอดมิน</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Info Profile */}
        <div className="bg-[#1E1E1E]/50 border border-white/5 rounded-xl p-3.5 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00B140]/20 flex items-center justify-center font-bold text-xs text-[#00B140]">
              A
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-gray-400 truncate">{currentUser.email}</div>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            ภาพรวมระบบ
          </button>
          <button
            onClick={() => { setActiveTab('products'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-products"
          >
            <ShoppingBag className="w-5 h-5" />
            จัดการสินค้า
          </button>
          <button
            onClick={() => { setActiveTab('members'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'members' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-members"
          >
            <Users className="w-5 h-5" />
            ลูกค้าร้านตู้
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-orders"
          >
            <ShoppingCart className="w-5 h-5" />
            คำสั่งซื้อ
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('banners'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'banners' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-banners"
          >
            <ImageIcon className="w-5 h-5" />
            แบนเนอร์โฆษณา
          </button>
          <button
            onClick={() => { setActiveTab('announcements'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'announcements' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-announcements"
          >
            <Megaphone className="w-5 h-5" />
            ข่าวสาร
            {announcements.length > 0 && (
              <span className="ml-auto bg-[#00B140]/20 text-[#00B140] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {announcements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setSearchTerm(''); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#00B140] text-black font-semibold shadow-lg shadow-[#00B140]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
            id="tab-settings"
          >
            <Settings className="w-5 h-5" />
            ตั้งค่าระบบ
          </button>
        </nav>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-150 cursor-pointer text-left"
            id="admin-logout-btn"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
        {/* TOP BAR / TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {activeTab === 'dashboard' && 'ภาพรวมระบบ'}
              {activeTab === 'products' && 'จัดการสินค้า'}
              {activeTab === 'members' && 'ลูกค้า'}
              {activeTab === 'orders' && 'คำสั่งซื้อจากร้านค้า'}
              {activeTab === 'banners' && 'จัดการรูปภาพสไลด์โฆษณา'}
              {activeTab === 'settings' && 'ตั้งค่าระบบร้านตู้'}
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {activeTab === 'dashboard' && 'ติดตามยอดขาย ข้อมูลสมาชิก และความเคลื่อนไหวออเดอร์'}
              {activeTab === 'products' && 'เพิ่มรายการสินค้า แตกสี/ความจำ กำหนดราคาทุนและผลกำไรคู่ค้า'}
              {activeTab === 'members' && 'อนุมัติผู้สมัครใหม่ จัดสิทธิ์ และดูแลความถูกต้องบัญชีสมาชิก'}
              {activeTab === 'orders' && 'ดำเนินการตรวจสอบคำสั่งซื้อ เปลี่ยนสถานะขนส่ง และส่งข้อมูลแจ้งเตือน'}
              {activeTab === 'banners' && 'จัดแต่งหน้าแรกด้วยสไลเดอร์รูปภาพแบนเนอร์โปรโมชั่นพิเศษ'}
              {activeTab === 'settings' && 'จัดการหมวดหมู่สินค้าแบรนด์เอง และกำหนดความดังเสียงแจ้งเตือนออเดอร์ใหม่'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-yellow-400 border border-white/5 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}
              id="admin-theme-toggle"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-indigo-400" />
              )}
            </button>

            {/* Global search except dashboard and settings */}
            {activeTab !== 'dashboard' && activeTab !== 'settings' && (
              <div className="relative flex-1 sm:w-64 sm:flex-none">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาด่วนที่นี่..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00B140] transition duration-150"
                  id="admin-search-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* --- 1. DASHBOARD VIEW --- */}
        {activeTab === 'dashboard' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#00B140]">
                    <CircleDollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">จัดส่งสำเร็จแล้ว</span>
                </div>
                <div className="text-2xl font-bold font-mono">฿{totalSales.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">ยอดขายที่เสร็จสิ้นสมบูรณ์</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-white/5 text-yellow-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">รอดำเนินการ</span>
                </div>
                <div className="text-2xl font-bold font-mono">฿{pendingSales.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">ยอดขายที่รอจัดส่ง/อนุมัติ</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-white/5 text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono">{members.filter(m => m.role === 'member').length}</div>
                <div className="text-xs text-gray-400 mt-1">สมาชิกร้านตู้ทั้งหมด</div>
              </div>

              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-white/5 text-sky-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono">{products.length}</div>
                <div className="text-xs text-gray-400 mt-1">สินค้าที่พร้อมให้บริการ</div>
              </div>
            </div>

            {/* Custom Interactive High-Fidelity SVG Charts & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart Glass Card */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#00B140]" />
                    แนวโน้มยอดขายและขีดการเติบโตของพันธมิตร
                  </h3>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-gray-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00B140]"></span> ยอดรวม
                    </span>
                  </div>
                </div>

                {/* Highly Crafted High-Contrast SVG Line Chart */}
                <div className="h-64 w-full relative flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00B140" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00B140" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    
                    {/* Filled gradient under line */}
                    <path d="M 0,200 L 0,180 Q 100,120 150,140 T 300,60 T 400,90 L 500,20 L 500,200 Z" fill="url(#chart-grad)" />
                    
                    {/* Glow stroke line */}
                    <path d="M 0,180 Q 100,120 150,140 T 300,60 T 400,90 L 500,20" fill="none" stroke="#00B140" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Data dots */}
                    <circle cx="150" cy="140" r="5" fill="#00B140" stroke="#111111" strokeWidth="2" className="cursor-pointer hover:r-7 transition-all duration-150" />
                    <circle cx="300" cy="60" r="5" fill="#00B140" stroke="#111111" strokeWidth="2" />
                    <circle cx="400" cy="90" r="5" fill="#00B140" stroke="#111111" strokeWidth="2" />
                    <circle cx="500" cy="20" r="5" fill="#00B140" stroke="#111111" strokeWidth="2" />
                  </svg>
                  
                  {/* Chart X axis markers */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 pt-2 text-[10px] text-gray-500 font-mono translate-y-4">
                    <span>ม.ค.</span>
                    <span>มี.ค.</span>
                    <span>พ.ค.</span>
                    <span>ก.ค. (ปัจจุบัน)</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[11px] text-gray-400">ออเดอร์เฉลี่ยต่อเดือน</div>
                    <div className="text-sm font-bold mt-0.5">8.5 ชุด</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400">อัตราจัดส่งเร็ว</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">96.8%</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400">กำไรสะสมร้านตู้ประมาณ</div>
                    <div className="text-sm font-bold text-[#00B140] mt-0.5">฿18,400</div>
                  </div>
                </div>
              </div>

              {/* Order Breakdown / Status List */}
              <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    สถานะคำสั่งซื้อในระบบขณะนี้
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                        <span className="text-xs font-medium">รออนุมัติจัดส่ง</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-300">{orders.filter(o => o.status === 'pending').length} รายการ</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                        <span className="text-xs font-medium">กำลังเตรียมแพ็คของ</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-300">{orders.filter(o => o.status === 'preparing').length} รายการ</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <span className="text-xs font-medium">จัดส่งแล้ว</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-300">{orders.filter(o => o.status === 'shipped').length} รายการ</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00B140]"></span>
                        <span className="text-xs font-medium">จัดส่งสำเร็จสมบูรณ์</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-300">{orders.filter(o => o.status === 'completed').length} รายการ</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 text-center">
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-[#00B140] hover:text-[#00ff5d] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    id="dashboard-go-orders"
                  >
                    จัดการคำสั่งซื้อทั้งหมด <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders inside Dashboard */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                คำสั่งซื้อล่าสุด
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">เลขที่ออเดอร์</th>
                      <th className="py-3 px-4">ลูกค้า</th>
                      <th className="py-3 px-4">ร้านค้าสมาชิก</th>
                      <th className="py-3 px-4">วันที่ทำรายการ</th>
                      <th className="py-3 px-4">ยอดเงินสุทธิ</th>
                      <th className="py-3 px-4">สถานะ</th>
                      <th className="py-3 px-4 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-white">{order.id}</td>
                        <td className="py-3.5 px-4 text-gray-300 font-medium">{order.memberName}</td>
                        <td className="py-3.5 px-4 text-gray-400">{order.memberShopName}</td>
                        <td className="py-3.5 px-4 text-gray-400">{new Date(order.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-3.5 px-4 font-bold text-white font-mono">฿{order.totalAmount.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                            order.status === 'preparing' ? 'bg-sky-500/15 text-sky-400' :
                            order.status === 'shipped' ? 'bg-indigo-500/15 text-indigo-400' :
                            order.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                            'bg-red-500/15 text-red-400'
                          }`}>
                            {order.status === 'pending' ? 'รออนุมัติ' :
                             order.status === 'preparing' ? 'กำลังเตรียมของ' :
                             order.status === 'shipped' ? 'จัดส่งแล้ว' :
                             order.status === 'completed' ? 'ส่งสำเร็จ' :
                             'ยกเลิกแล้ว'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center p-1 px-2.5 bg-white/5 hover:bg-[#00B140]/10 border border-white/10 hover:border-[#00B140]/30 rounded-lg text-gray-300 hover:text-[#00B140] transition duration-150 cursor-pointer text-[11px]"
                            id={`view-order-dashboard-${order.id}`}
                          >
                            เปิดดูใบออเดอร์
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="inline-flex items-center p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer"
                            title="ลบคำสั่งซื้อ"
                            id={`delete-order-dashboard-${order.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 2. PRODUCTS VIEW --- */}
        {activeTab === 'products' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs text-gray-400 font-medium">ค้นพบทั้งหมด {filteredProducts.length} รายการสินค้า</span>
              <button
                onClick={handleOpenAddProduct}
                className="py-2.5 px-4 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00B140]/10 cursor-pointer"
                id="add-new-product-btn"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
                // Show min/max pricing range or primary price
                const prices = prod.variants.map(v => v.memberPrice);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const brandColors: Record<string, string> = {
                  Apple: 'bg-white/10 border-white/20 text-white',
                  Samsung: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                  Xiaomi: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
                  OPPO: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  vivo: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                  realme: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                };

                return (
                  <div key={prod.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col glow-green-hover transition-all duration-300">
                    <div className="relative h-48 bg-black/40 flex items-center justify-center overflow-hidden shrink-0 group">
                      <img 
                        src={prod.images[0]} 
                        alt={prod.name} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold border ${brandColors[prod.brand] || 'bg-white/5 text-gray-300'}`}>
                        {prod.brand}
                      </span>
                      <button
                        onClick={() => {
                          const updated = { ...prod, active: !prod.active };
                          MPhoneDatabase.saveProduct(updated);
                          fetchData();
                          success(`อัปเดตการแสดงผลสินค้า "${prod.name}" เรียบร้อยแล้ว`, 'สำเร็จ');
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md cursor-pointer ${
                          prod.active ? 'bg-[#00B140]/20 text-[#00B140] border border-[#00B140]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                        title={prod.active ? 'แสดงผลอยู่' : 'ถูกปิดซ่อน'}
                        id={`toggle-active-${prod.id}`}
                      >
                        {prod.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-base text-white tracking-tight line-clamp-1">{prod.name}</h4>
                        <p className="text-gray-400 text-xs mt-1 font-medium">รุ่น: {prod.model}</p>
                        <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{prod.description}</p>
                        
                        {/* Variant list preview */}
                        <div className="mt-3.5 space-y-1 bg-black/30 p-2 rounded-xl border border-white/5">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">ราคาและตัวเลือก:</div>
                          {prod.variants.map((v, i) => (
                            <div key={v.id || i} className="flex justify-between items-center text-[11px] font-mono py-0.5 text-gray-300">
                              <span>{v.color} ({v.storage})</span>
                              <span className="text-[#00B140] font-bold">฿{v.memberPrice.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5 flex gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          id={`edit-prod-${prod.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                          id={`delete-prod-${prod.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* --- 3. MEMBERS VIEW --- */}
        {activeTab === 'members' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs text-gray-400 font-medium">ค้นพบทั้งหมด {filteredMembers.length} คนในเครือ</span>
              <button
                onClick={handleOpenAddMember}
                className="py-2.5 px-4 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00B140]/10 cursor-pointer"
                id="add-new-member-btn"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                เพิ่มสมาชิกใหม่
              </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-5 whitespace-nowrap">ชื่อ-นามสกุล</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">ร้านค้า</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">ข้อมูลการติดต่อ</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">ระดับสิทธิ์</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">สถานะอนุมัติ</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredMembers.map((mem) => (
                      <tr key={mem.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#00B140]/10 flex items-center justify-center font-bold text-xs text-[#00B140] shrink-0">
                              {(mem.name || 'M').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate max-w-[150px] sm:max-w-[200px]" title={mem.name || ''}>
                                {mem.name || 'ไม่มีชื่อ'}
                              </span>
                              {mem.creditDays && mem.creditDays > 0 ? (
                                <span className="inline-block mt-1 bg-[#00B140]/10 border border-[#00B140]/30 text-[#00B140] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                  💳 เครดิต {mem.creditDays} วัน
                                </span>
                              ) : (
                                <span className="inline-block mt-1 bg-white/5 border border-white/10 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                  💵 ซื้อเงินสดโอนทันที
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-gray-300 font-medium truncate max-w-[150px]" title={mem.shopName || ''}>
                          {mem.shopName || '-'}
                        </td>
                        <td className="py-4 px-5 space-y-0.5 min-w-[120px]">
                          <div className="text-gray-300 font-mono">{mem.phone || '-'}</div>
                          <div className="text-gray-400 font-mono text-[11px] truncate max-w-[150px]" title={mem.email || ''}>
                            {mem.email || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                            mem.role === 'admin' ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-gray-500/15 text-gray-300'
                          }`}>
                            {mem.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้าร้านตู้'}
                          </span>
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (mem.id === 'm_admin') return;
                              const updated = { ...mem, active: !mem.active };
                              MPhoneDatabase.saveMember(updated);
                              fetchData();
                              success(`อัปเดตสถานะของลูกค้า "${mem.name}" เรียบร้อยแล้ว`, 'สำเร็จ');
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition duration-200 cursor-pointer whitespace-nowrap ${
                              mem.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'
                            }`}
                            disabled={mem.id === 'm_admin'}
                            id={`toggle-member-active-${mem.id}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mem.active ? 'bg-emerald-400' : 'bg-yellow-400'}`}></span>
                            <span>{mem.active ? 'อนุมัติ / เปิดใช้งาน' : 'รอตรวจสอบ / ปิด'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => handleResetPassword(mem)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg border border-white/5 cursor-pointer"
                              title="รีเซ็ตรหัสผ่านลูกค้า"
                              id={`reset-pass-mem-${mem.id}`}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditMember(mem)}
                              className="p-1.5 bg-[#00B140]/10 hover:bg-[#00B140]/20 text-[#00B140] rounded-lg border border-[#00B140]/20 cursor-pointer"
                              id={`edit-mem-${mem.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(mem.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer"
                              disabled={mem.id === 'm_admin'}
                              id={`delete-mem-${mem.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 4. ORDERS VIEW --- */}
        {activeTab === 'orders' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-5 whitespace-nowrap">เลขออเดอร์</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">สมาชิก / ร้านค้า</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">วันที่สั่งซื้อ</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">รายการสินค้า</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">ยอดรวมสุทธิ</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">สถานะขนส่ง</th>
                      <th className="py-3.5 px-5 text-right whitespace-nowrap">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-mono font-bold text-white text-xs">{order.id}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {order.deliveryType === 'delivery' ? (
                              <span className="text-[9px] font-semibold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded-md">🚚 แฟลช</span>
                            ) : (
                              <span className="text-[9px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md">🏪 รับร้าน</span>
                            )}
                            {order.paymentMethod === 'credit' ? (
                              <span className="text-[9px] font-bold text-[#00B140] bg-[#00B140]/10 border border-[#00B140]/20 px-1.5 py-0.5 rounded-md">💳 {order.creditDays} วัน</span>
                            ) : (
                              <span className="text-[9px] font-semibold text-gray-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">💵 สด</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-white">{order.memberName}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{order.memberShopName}</div>
                        </td>
                        <td className="py-4 px-5 text-gray-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString('th-TH', { 
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-5 max-w-xs truncate">
                          <div className="truncate text-gray-300 font-medium">
                            {order.items.map(item => `${item.productName} (${item.color}/${item.storage}) x${item.quantity}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-4 px-5 font-bold text-[#00B140] font-mono">฿{order.totalAmount.toLocaleString()}</td>
                        <td className="py-4 px-5">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none bg-black border cursor-pointer border-white/10 ${
                              order.status === 'pending' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' :
                              order.status === 'preparing' ? 'text-sky-400 border-sky-500/30 bg-sky-500/10' :
                              order.status === 'shipped' ? 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' :
                              order.status === 'completed' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                              'text-red-400 border-red-500/30 bg-red-500/10'
                            }`}
                            id={`status-select-${order.id}`}
                          >
                            <option value="pending" className="text-white bg-[#1A1A1A]">รออนุมัติ</option>
                            <option value="preparing" className="text-white bg-[#1A1A1A]">กำลังเตรียมสินค้า</option>
                            <option value="shipped" className="text-white bg-[#1A1A1A]">จัดส่งแล้ว</option>
                            <option value="completed" className="text-white bg-[#1A1A1A]">จัดส่งสำเร็จ</option>
                            <option value="canceled" className="text-white bg-[#1A1A1A]">ยกเลิกออเดอร์</option>
                          </select>
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="inline-flex items-center gap-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 cursor-pointer"
                              id={`view-order-detail-${order.id}`}
                            >
                              เปิดรายละเอียด
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="inline-flex items-center p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer"
                              title="ลบคำสั่งซื้อ"
                              id={`delete-order-${order.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 5. BANNERS VIEW --- */}
        {activeTab === 'banners' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
              <span className="text-xs text-gray-400 font-medium">ค้นพบรูปภาพสไลเดอร์ทั้งหมด {banners.length} ชิ้น</span>
              <button
                onClick={handleOpenAddBanner}
                className="py-2.5 px-4 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00B140]/10 cursor-pointer"
                id="add-new-banner-btn"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                เพิ่มแบนเนอร์ใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col">
                  <div className="relative h-48 bg-black">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-5">
                      <h4 className="font-bold text-white text-base leading-tight drop-shadow">{banner.title}</h4>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          const updated = { ...banner, active: !banner.active };
                          MPhoneDatabase.saveBanner(updated);
                          fetchData();
                          success(`อัปเดตการแสดงผลแบนเนอร์ "${banner.title}" เรียบร้อยแล้ว`, 'สำเร็จ');
                        }}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer ${
                          banner.active ? 'bg-[#00B140]/10 text-[#00B140] border border-[#00B140]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                        id={`toggle-banner-${banner.id}`}
                      >
                        {banner.active ? 'เปิดโชว์หน้าร้าน' : 'ซ่อนชั่วคราว'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                      id={`delete-banner-${banner.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- 5.5 ANNOUNCEMENTS VIEW --- */}
        {activeTab === 'announcements' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#00B140]" />
                  ระบบข่าวสารสมาชิกร้านค้า 📢
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">ประกาศโปรโมชั่นด่วน กิจกรรมสำคัญ และข่าวสารส่งตรงถึงสมาชิกทุกท่าน</p>
              </div>
              <button
                onClick={handleOpenAddAnnouncement}
                className="py-2.5 px-4 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00B140]/10 cursor-pointer shrink-0"
                id="add-new-announcement-btn"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                สร้างประกาศใหม่
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-[#1A1A1A]/40 rounded-2xl border border-white/5">
                  <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium text-sm">ยังไม่มีประกาศข่าวสารใดๆ ในระบบ</p>
                  <p className="text-xs text-gray-600 mt-1">กดที่ปุ่ม "สร้างประกาศใหม่" เพื่อเริ่มกระจายข่าวสารให้สมาชิก</p>
                </div>
              ) : (
                announcements.map((ann) => (
                  <div key={ann.id} className="bg-[#1A1A1A]/60 border border-white/5 hover:border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group transition duration-200">
                    {/* Top Type ribbon or dot */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      ann.type === 'promo' ? 'bg-amber-500' :
                      ann.type === 'alert' ? 'bg-red-500' :
                      ann.type === 'news' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          ann.type === 'promo' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          ann.type === 'alert' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          ann.type === 'news' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          'bg-emerald-500/10 text-[#00B140] border border-[#00B140]/20'
                        }`}>
                          {ann.type === 'promo' ? 'โปรโมชั่นพิเศษ' :
                           ann.type === 'alert' ? 'ประกาศด่วนที่สุด' :
                           ann.type === 'news' ? 'ประกาศข่าวสาร' : 'ทั่วไป'}
                        </span>
                        
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(ann.createdAt).toLocaleDateString('th-TH', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-white line-clamp-1 group-hover:text-[#00B140] transition">
                        {ann.title}
                      </h4>
                      
                      <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-xl border border-white/5 min-h-[96px]">
                        {ann.content}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/5 flex gap-2 items-center">
                      <button
                        onClick={() => {
                          const updated = { ...ann, active: !ann.active };
                          MPhoneDatabase.saveAnnouncement(updated);
                          fetchData();
                          success(`อัปเดตการแสดงผลประกาศ "${ann.title}" เรียบร้อยแล้ว`, 'สำเร็จ');
                        }}
                        className={`px-2.5 py-2 rounded-xl text-[10px] font-bold cursor-pointer transition shrink-0 ${
                          ann.active ? 'bg-[#00B140]/10 text-[#00B140] border border-[#00B140]/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                        id={`toggle-ann-active-${ann.id}`}
                      >
                        {ann.active ? 'เปิดแสดง' : 'ปิดแสดง'}
                      </button>

                      <button
                        onClick={() => handleOpenEditAnnouncement(ann)}
                        className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        id={`edit-ann-${ann.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                        id={`delete-ann-${ann.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* --- 6. SETTINGS VIEW --- */}
        {activeTab === 'settings' && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Category Management */}
              <div className="glass-card rounded-2xl border border-white/5 p-4 sm:p-6 space-y-6 bg-[#1A1A1A]/40 backdrop-blur-md">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#00B140]" />
                    จัดการหมวดหมู่ยี่ห้อสินค้าเอง
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    เพิ่มหรือลบชื่อหมวดหมู่ยี่ห้อสำหรับใช้ในการระบุสินค้า และการกรองสินค้าหน้าแรกของพาร์ทเนอร์
                  </p>
                </div>

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="เช่น OPPO, HONOR, Huawei, iPad, AirPods"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00B140]"
                    id="new-category-input"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    id="add-category-btn"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    เพิ่มยี่ห้อ
                  </button>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">หมวดหมู่ทั้งหมดในระบบ</h4>
                  <div className="divide-y divide-white/5 bg-black/40 border border-white/5 rounded-xl max-h-[300px] overflow-y-auto">
                    {categories.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500">ไม่มีหมวดหมู่ยี่ห้อสินค้าในระบบ</div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat} className="flex justify-between items-center p-3.5 hover:bg-white/5 transition-colors">
                          <span className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00B140]"></span>
                            {cat}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer transition duration-150"
                            title={`ลบหมวดหมู่ ${cat}`}
                            id={`del-cat-${cat}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sound Alert Settings */}
              <div className="glass-card rounded-2xl border border-white/5 p-4 sm:p-6 space-y-6 bg-[#1A1A1A]/40 backdrop-blur-md">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[#00B140] animate-spin-slow" />
                    ระบบแจ้งเตือนออเดอร์ใหม่แบบมีเสียง
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    เมื่อมีพาร์ทเนอร์พรีเมียมส่งใบสั่งซื้อเข้ามาในระบบ จะมีเสียงแจ้งเตือนอัตโนมัติเพื่อให้ฝ่ายแอดมินจัดเตรียมส่งพัสดุได้ทันที
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Enabled Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl">
                    <div>
                      <div className="text-xs font-bold text-white">เปิดใช้เสียงแจ้งเตือนออเดอร์ใหม่</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">เปิดเสียงระบบสังเคราะห์เสียงอัตโนมัติ</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={soundEnabled} 
                        onChange={(e) => setSoundEnabled(e.target.checked)}
                        className="sr-only peer"
                        id="sound-alert-toggle"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B140]"></div>
                    </label>
                  </div>

                  {soundEnabled && (
                    <>
                      {/* Sound Type Selection */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-300">ประเภทโทนเสียงแจ้งเตือน</label>
                        <select
                          value={soundType}
                          onChange={(e) => setSoundType(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00B140]"
                          id="sound-type-select"
                        >
                          <option value="bell" className="text-white bg-[#1A1A1A]">🛎️ เสียงกระดิ่ง</option>
                          <option value="beep" className="text-white bg-[#1A1A1A]">📟 เสียงปี๊ป</option>
                          <option value="fantasy" className="text-white bg-[#1A1A1A]">✨ เสียงแฟนตาซี</option>
                          <option value="siren" className="text-white bg-[#1A1A1A]">🚨 เสียงไซเรน</option>
                          <option value="custom" className="text-white bg-[#1A1A1A]">🔗 ลิงก์ไฟล์เสียงภายนอก</option>
                        </select>
                      </div>

                      {/* Custom Sound URL */}
                      {soundType === 'custom' && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-gray-300">ลิงก์ไฟล์เสียงของคุณ</label>
                          <input
                            type="text"
                            placeholder="https://example.com/sound.mp3"
                            value={soundUrl}
                            onChange={(e) => setSoundUrl(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#00B140]"
                            id="sound-url-input"
                          />
                          <p className="text-[10px] text-gray-500">
                            *กรุณาใช้ลิงก์ไฟล์เสียงโดยตรงที่รองรับการเข้าถึง เช่นไฟล์สกุล .mp3, .wav, หรือ .ogg
                          </p>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleTestSound}
                          className="w-full sm:flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                          id="test-sound-btn"
                        >
                          📢 ทดลองกดฟังเสียง
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveSoundSettings}
                          className="w-full sm:flex-1 py-2.5 px-4 bg-[#00B140] hover:bg-[#009134] text-black rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                          id="save-sound-btn"
                        >
                          💾 บันทึกค่าพรีเซ็ตเสียง
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </main>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#00B140]" />
                {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่พรีเมียม'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="text-gray-400 hover:text-white cursor-pointer"
                id="close-prod-modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">ชื่อสินค้าหลัก</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="เช่น iPhone 15 Pro Max, Galaxy S24 Ultra"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00B140]"
                    id="form-prod-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">ยี่ห้อ</label>
                    <select
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00B140]"
                      id="form-prod-brand"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="text-white bg-[#1A1A1A]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">รุ่นสินค้า</label>
                    <input
                      type="text"
                      required
                      value={prodModel}
                      onChange={(e) => setProdModel(e.target.value)}
                      placeholder="เช่น 15 Pro Max, S24"
                      className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00B140]"
                      id="form-prod-model"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">คำอธิบายรายละเอียด</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="รายละเอียดเด่นสำหรับการขาย ข้อความโปรโมท..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#00B140]"
                  id="form-prod-desc"
                />
              </div>

              {/* IMAGE INPUTS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-300 uppercase">ลิงก์รูปภาพสินค้าหลักและภาพเพิ่มเติม</label>
                  <button 
                    type="button" 
                    onClick={handleAddImage}
                    className="text-[#00B140] text-xs font-bold hover:underline cursor-pointer"
                    id="add-image-url-btn"
                  >
                    + เพิ่มช่องรูปเพิ่ม
                  </button>
                </div>
                {prodImages.map((imgUrl, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={imgUrl}
                      onChange={(e) => handleUpdateImage(e.target.value, index)}
                      placeholder="วาง URL ของรูปภาพสินค้าที่นี่..."
                      className="flex-1 px-3.5 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#00B140]"
                      id={`form-image-url-${index}`}
                    />
                    {prodImages.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveImage(index)}
                        className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 cursor-pointer"
                        id={`remove-image-url-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* DYNAMIC VARIANTS SECTION */}
              <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-2xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-white">ราคารายละเอียดสีและหน่วยความจำ</h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="py-1.5 px-3 bg-[#00B140]/10 hover:bg-[#00B140]/20 text-[#00B140] border border-[#00B140]/20 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    id="add-variant-btn"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> เพิ่มสี/สเปก
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {prodVariants.map((v, index) => (
                    <div key={v.id || index} className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 p-3.5 bg-white/5 border border-white/5 rounded-xl items-center relative">
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">สีตัวเครื่อง</label>
                        <input
                          type="text"
                          required
                          value={v.color}
                          onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                          placeholder="เช่น Natural"
                          className="w-full px-2.5 py-2 bg-black border border-white/10 rounded-lg text-xs"
                          id={`variant-color-${index}`}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">ความจำ RAM/ROM</label>
                        <input
                          type="text"
                          required
                          value={v.storage}
                          onChange={(e) => handleUpdateVariant(index, 'storage', e.target.value)}
                          placeholder="เช่น 256GB"
                          className="w-full px-2.5 py-2 bg-black border border-white/10 rounded-lg text-xs"
                          id={`variant-storage-${index}`}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">ราคาทุน</label>
                        <input
                          type="number"
                          required
                          value={v.costPrice || ''}
                          onChange={(e) => handleUpdateVariant(index, 'costPrice', e.target.value)}
                          placeholder="ราคาทุน"
                          className="w-full px-2.5 py-2 bg-black border border-white/10 rounded-lg text-xs font-mono font-bold"
                          id={`variant-cost-${index}`}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">ราคาขายร้านตู้</label>
                        <input
                          type="number"
                          required
                          value={v.memberPrice || ''}
                          onChange={(e) => handleUpdateVariant(index, 'memberPrice', e.target.value)}
                          placeholder="ร้านตู้ซื้อ"
                          className="w-full px-2.5 py-2 bg-black border border-white/10 rounded-lg text-xs font-mono text-[#00B140] font-bold"
                          id={`variant-member-${index}`}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">ราคาขายปลีกแนะนำ</label>
                        <input
                          type="number"
                          required
                          value={v.retailPrice || ''}
                          onChange={(e) => handleUpdateVariant(index, 'retailPrice', e.target.value)}
                          placeholder="แนะนำขาย"
                          className="w-full px-2.5 py-2 bg-black border border-white/10 rounded-lg text-xs font-mono text-gray-300"
                          id={`variant-retail-${index}`}
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-center pt-3.5 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/25 transition-colors cursor-pointer"
                          id={`remove-variant-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OFFS & SPECS & FREEBIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Specifications Form */}
                <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300 uppercase">สเปกสินค้าหลัก</label>
                    <button type="button" onClick={handleAddSpec} className="text-[#00B140] text-xs font-bold cursor-pointer">+ เพิ่มสเปก</button>
                  </div>
                  {prodSpecs.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={spec}
                        onChange={(e) => handleUpdateSpec(e.target.value, idx)}
                        placeholder="เช่น ชิปเซ็ต: A17 Pro (3nm)"
                        className="flex-1 px-3 py-2 bg-black border border-white/10 rounded-lg text-xs"
                        id={`spec-input-${idx}`}
                      />
                      {prodSpecs.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSpec(idx)} className="text-red-400 p-1 hover:text-red-300">ลบ</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Freebies Form */}
                <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-300 uppercase">ของแถมพ่วง</label>
                    <button type="button" onClick={handleAddFreebie} className="text-[#00B140] text-xs font-bold cursor-pointer">+ เพิ่มของแถม</button>
                  </div>
                  {prodFreebies.map((freebie, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={freebie}
                        onChange={(e) => handleUpdateFreebie(e.target.value, idx)}
                        placeholder="เช่น ฟิล์มกระจก Gorilla Glass"
                        className="flex-1 px-3 py-2 bg-black border border-white/10 rounded-lg text-xs"
                        id={`freebie-input-${idx}`}
                      />
                      {prodFreebies.length > 1 && (
                        <button type="button" onClick={() => handleRemoveFreebie(idx)} className="text-red-400 p-1 hover:text-red-300">ลบ</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Show Status Display */}
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <span className="text-sm font-semibold text-white">การแสดงผลสินค้าในระบบ:</span>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodActive}
                    onChange={(e) => setProdActive(e.target.checked)}
                    className="w-4.5 h-4.5 accent-[#00B140] bg-black rounded"
                    id="form-prod-active"
                  />
                  <span className="text-xs text-gray-300">เปิดวางขายออนไลน์ / แสดงในฝั่งลูกค้า</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs cursor-pointer"
                  id="cancel-save-prod"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl text-xs cursor-pointer"
                  id="confirm-save-prod"
                >
                  บันทึกข้อมูลสินค้า
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- ADD / EDIT MEMBER MODAL --- */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00B140]" />
                {editingMember ? 'แก้ไขข้อมูลลูกค้าร้านตู้' : 'เพิ่มลูกค้าร้านตู้คนใหม่'}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ชื่อ-นามสกุล </label>
                <input
                  type="text"
                  required
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  placeholder="เช่น นายศักดิ์สิทธิ์ ยอดโมบาย"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white"
                  id="form-mem-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ชื่อร้านค้า / สาขา</label>
                <input
                  type="text"
                  required
                  value={memShop}
                  onChange={(e) => setMemShop(e.target.value)}
                  placeholder="เช่น มังกรทองโมบาย สระบุรี"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white"
                  id="form-mem-shop"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    required
                    value={memPhone}
                    onChange={(e) => setMemPhone(e.target.value)}
                    placeholder="เช่น 0891234567"
                    className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white font-mono"
                    id="form-mem-phone"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">อีเมลเข้าระบบ</label>
                  <input
                    type="email"
                    required
                    value={memEmail}
                    onChange={(e) => setMemEmail(e.target.value)}
                    placeholder="เช่น user@partner.com"
                    className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white font-mono"
                    id="form-mem-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  {editingMember ? 'รหัสผ่านเข้าระบบ (ว่างไว้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเข้าระบบ (ว่างไว้จะใช้ค่าเริ่มต้น: 123456)'}
                </label>
                <input
                  type="text"
                  value={memPassword}
                  onChange={(e) => setMemPassword(e.target.value)}
                  placeholder={editingMember ? "พิมพ์เพื่อเปลี่ยนรหัสผ่านใหม่" : "กำหนดรหัสผ่าน เช่น 123456"}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white font-mono"
                  id="form-mem-password"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">ระดับสิทธิ์</label>
                  <select
                    value={memRole}
                    onChange={(e) => setMemRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white"
                    disabled={editingMember?.id === 'm_admin'}
                    id="form-mem-role"
                  >
                    <option value="member" className="text-white bg-[#1A1A1A]">ลูกค้าร้านตู้</option>
                    <option value="admin" className="text-white bg-[#1A1A1A]">ผู้ดูแลระบบ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">สถานะแอคเคาท์</label>
                  <select
                    value={memActive ? 'true' : 'false'}
                    onChange={(e) => setMemActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-white"
                    disabled={editingMember?.id === 'm_admin'}
                    id="form-mem-active"
                  >
                    <option value="true" className="text-white bg-[#1A1A1A]">เปิดใช้งาน / อนุมัติ</option>
                    <option value="false" className="text-white bg-[#1A1A1A]">รอการตรวจสอบ / ระงับ</option>
                  </select>
                </div>
              </div>

              {/* Credit Days Assignment (7, 10, 30 days) */}
              {memRole === 'member' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">อนุมัติเครดิตร้านตู้</label>
                  <select
                    value={memCreditDays}
                    onChange={(e) => setMemCreditDays(Number(e.target.value) as 0 | 7 | 10 | 30)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-xl text-xs text-[#00B140] font-bold"
                    id="form-mem-credit-days"
                  >
                    <option value={0} className="text-white bg-[#1A1A1A]">ไม่มีวงเงินเครดิต / ซื้อสดโอนทันที เท่านั้น</option>
                    <option value={7} className="text-[#00B140] bg-[#1A1A1A] font-bold">อนุมัติเครดิต 7 วัน</option>
                    <option value={10} className="text-[#00B140] bg-[#1A1A1A] font-bold">อนุมัติเครดิต 10 วัน</option>
                    <option value={30} className="text-[#00B140] bg-[#1A1A1A] font-bold">อนุมัติเครดิต 30 วัน</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-5 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10 cursor-pointer"
                  id="cancel-save-mem"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B140] text-black font-semibold rounded-lg text-xs hover:bg-[#009134] cursor-pointer"
                  id="confirm-save-mem"
                >
                  บันทึกลูกค้า
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- ADD / EDIT BANNER MODAL --- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#00B140]" />
                เพิ่มสไลด์โปรโมชั่นหน้าร้าน
              </h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">หัวข้อแบนเนอร์</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="เช่น มหกรรม Apple ลดราคาสนั่นคู่ค้า"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white"
                  id="form-banner-title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ลิงก์รูปภาพสไลด์แบนเนอร์</label>
                <input
                  type="text"
                  required
                  value={bannerImg}
                  onChange={(e) => setBannerImg(e.target.value)}
                  placeholder="ลิงก์ URL รูปภาพกว้าง 16:9 ขึ้นไป"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white font-mono"
                  id="form-banner-img"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="banner-status-chk"
                  checked={bannerActive}
                  onChange={(e) => setBannerActive(e.target.checked)}
                  className="w-4 h-4 accent-[#00B140]"
                />
                <label htmlFor="banner-status-chk" className="text-xs text-gray-300 cursor-pointer">เปิดแบนเนอร์นี้ให้เลื่อนโชว์หน้าแรกทันที</label>
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-xs cursor-pointer"
                  id="cancel-banner-save"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B140] text-black font-semibold rounded-lg text-xs hover:bg-[#009134] cursor-pointer"
                  id="confirm-banner-save"
                >
                  จัดเก็บแบนเนอร์
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- ADD / EDIT ANNOUNCEMENT MODAL --- */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#00B140]" />
                {editingAnn ? 'แก้ไขประกาศข่าวสาร' : 'สร้างประกาศข่าวสารใหม่'}
              </h3>
              <button onClick={() => setIsAnnModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">หัวข้อประกาศ</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="เช่น ปรับราคาส่งต้อนรับสัปดาห์ใหม่ หรือ ปิดทำการร้าน 1 วัน"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00B140]"
                  id="form-ann-title"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ประเภทประกาศ</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'info', label: '📢 ทั่วไป', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10' },
                    { value: 'promo', label: '🔥 โปรโมชั่น', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10' },
                    { value: 'alert', label: '🚨 ด่วนที่สุด', color: 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10' },
                    { value: 'news', label: '📰 ข่าวสาร', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10' }
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAnnType(t.value as any)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        annType === t.value 
                          ? 'border-[#00B140] text-[#00B140] bg-[#00B140]/10 font-bold' 
                          : t.color
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">เนื้อหารายละเอียดข่าวสาร</label>
                <textarea
                  required
                  rows={5}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="รายละเอียดข้อความที่ต้องการแจ้งเตือนแก่สมาชิกพาร์ทเนอร์ทุกคน... (รองรับการขึ้นบรรทัดใหม่)"
                  className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00B140] resize-none"
                  id="form-ann-content"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-xs hover:bg-white/10 cursor-pointer"
                  id="cancel-ann-save"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B140] text-black font-semibold rounded-lg text-xs hover:bg-[#009134] cursor-pointer"
                  id="confirm-ann-save"
                >
                  บันทึกประกาศข่าวสาร
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* --- ORDER DETAIL DIALOG MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative my-8"
          >
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-mono">{selectedOrder.id}</h3>
                <p className="text-xs text-gray-400 mt-1">ออเดอร์โดย คุณ{selectedOrder.memberName} ({selectedOrder.memberShopName})</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-gray-400 hover:text-white cursor-pointer"
                id="close-order-modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Customer summary */}
              <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl text-xs">
                <div>
                  <div className="text-gray-400 font-medium">ชื่อลูกค้า:</div>
                  <div className="text-white font-bold mt-1">{selectedOrder.memberName}</div>
                  <div className="text-gray-400 font-medium mt-3">ชื่อสาขา/ร้านค้า:</div>
                  <div className="text-[#00B140] font-bold mt-1">{selectedOrder.memberShopName}</div>
                  <div className="text-gray-400 font-medium mt-3">รูปแบบการส่งสินค้า:</div>
                  <div className="text-white font-bold mt-1">
                    {selectedOrder.deliveryType === 'delivery' ? '🚚 จัดส่งแฟลช' : '🏪 มารับหน้าร้านด้วยตนเอง'}
                  </div>
                  <div className="text-gray-400 font-medium mt-3">วันเวลาที่จะรับ/จัดส่ง:</div>
                  <div className="text-gray-300 font-bold mt-1">{selectedOrder.deliveryTime || 'จัดส่งด่วนที่สุด'}</div>
                </div>
                <div>
                  <div className="text-gray-400 font-medium">วันเวลาที่สั่งซื้อ:</div>
                  <div className="text-white font-mono mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="text-gray-400 font-medium mt-3">วิธีชำระเงินของออเดอร์:</div>
                  <div className="text-[#00B140] font-bold mt-1">
                    {selectedOrder.paymentMethod === 'credit' ? `💳 เครดิตพาร์ทเนอร์ ${selectedOrder.creditDays} วัน` : '💵 โอนเงินสด / ทันที'}
                  </div>
                  <div className="text-gray-400 font-medium mt-3">หมายเหตุของคู่ค้า:</div>
                  <div className="text-gray-200 mt-1 font-medium bg-black/40 p-2 rounded border border-white/5 truncate max-w-xs" title={selectedOrder.note}>
                    {selectedOrder.note || 'ไม่มีระบุ'}
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายการสินค้าสั่งซื้อ</h4>
                <div className="divide-y divide-white/5 bg-black/40 border border-white/5 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 items-center">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.productName}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">สี: {item.color} | สเปก: {item.storage}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-mono">ราคาขายแนะนำ: ฿{item.retailPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#00B140] font-mono">฿{item.memberPrice.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">จำนวน x{item.quantity} ชิ้น</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="bg-[#00B140]/5 border border-[#00B140]/15 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-300 font-semibold">ยอดรวมทั้งสิ้น (คู่ค้าต้องชำระ)</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">*ราคานี้เป็นราคาส่งสมาชิก ไม่เปิดเผยคนนอก</div>
                </div>
                <div className="text-xl font-bold font-mono text-[#00B140]">฿{selectedOrder.totalAmount.toLocaleString()}</div>
              </div>

              {/* Order Status Timeline tracker */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ประวัติสถานะคำสั่งซื้อ</h4>
                <div className="space-y-2.5 pl-3 border-l-2 border-white/10">
                  {selectedOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="relative text-xs flex items-center gap-2.5">
                      <span className="absolute -left-[16px] w-2.5 h-2.5 rounded-full bg-[#00B140] ring-4 ring-[#111111]"></span>
                      <span className="font-semibold capitalize text-gray-200">
                        {hist.status === 'pending' && '✓ สมาชิกส่งใบคำสั่งซื้อเข้ามาในระบบ (รออนุมัติ)'}
                        {hist.status === 'preparing' && '⚙ ผู้ดูแลตรวจสอบกำลังเตรียมหยิบสินค้า'}
                        {hist.status === 'shipped' && '🚚 พัสดุถูกจัดส่งเรียบร้อยแล้ว'}
                        {hist.status === 'completed' && '🎉 ปิดออเดอร์ ขนส่งจัดส่งสำเร็จเสร็จสิ้น'}
                        {hist.status === 'canceled' && '❌ คำสั่งซื้อนี้ถูกยกเลิก'}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        ({new Date(hist.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center pt-4 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">ปรับเปลี่ยนสถานะขนส่ง:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black border border-white/10 text-white focus:outline-none min-w-[140px] cursor-pointer"
                    id="modal-order-status"
                  >
                    <option value="pending" className="text-white bg-[#1A1A1A]">รออนุมัติ</option>
                    <option value="preparing" className="text-white bg-[#1A1A1A]">กำลังเตรียมสินค้า</option>
                    <option value="shipped" className="text-white bg-[#1A1A1A]">จัดส่งแล้ว</option>
                    <option value="completed" className="text-white bg-[#1A1A1A]">จัดส่งสำเร็จ</option>
                    <option value="canceled" className="text-white bg-[#1A1A1A]">ยกเลิกออเดอร์</option>
                  </select>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <button
                    onClick={() => {
                      handleDeleteOrder(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 sm:flex-initial py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    id="modal-delete-order-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" /> <span>ลบออเดอร์นี้</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 sm:flex-initial py-2 px-5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs text-center cursor-pointer whitespace-nowrap"
                    id="close-order-modal-btn"
                  >
                    ปิดหน้านี้
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
    </div>
  );
}
