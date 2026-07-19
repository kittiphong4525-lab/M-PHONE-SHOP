import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, X, HelpCircle, ChevronRight, CheckCircle2, Share, PlusSquare, MoreVertical, Compass } from 'lucide-react';

interface InstallPromptProps {
  theme?: 'dark' | 'light';
  forceShowTrigger?: boolean;
  onCloseTrigger?: () => void;
}

export default function InstallPrompt({ theme = 'dark', forceShowTrigger = false, onCloseTrigger }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(forceShowTrigger);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  useEffect(() => {
    if (forceShowTrigger) {
      setShowGuideModal(true);
    }
  }, [forceShowTrigger]);

  useEffect(() => {
    const handleShowGuide = () => {
      setShowGuideModal(true);
    };
    window.addEventListener('show-install-guide', handleShowGuide);
    return () => {
      window.removeEventListener('show-install-guide', handleShowGuide);
    };
  }, []);

  useEffect(() => {
    // Check if the app is already running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Auto-detect device OS for the default guide tab
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      setActiveTab('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setActiveTab('ios');
    }

    // Check if user previously dismissed the install banner
    const isDismissed = localStorage.getItem('mphone_pwa_dismissed') === 'true';

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No native prompt available, show detailed installation guide instead
      setShowGuideModal(true);
      return;
    }

    // Trigger the native install prompt (Android/Chrome)
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We can only use the prompt once, clear it
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('mphone_pwa_dismissed', 'true');
    setShowBanner(false);
    if (onCloseTrigger) {
      onCloseTrigger();
    }
  };

  const handleOpenGuide = () => {
    setShowGuideModal(true);
  };

  const handleCloseGuide = () => {
    setShowGuideModal(false);
    if (onCloseTrigger) {
      onCloseTrigger();
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* 1. Add to Home Screen Floating Bottom Banner */}
      <AnimatePresence>
        {showBanner && !showGuideModal && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50"
          >
            <div className={`p-4 rounded-2xl shadow-2xl border ${
              isDark 
                ? 'bg-[#151515]/95 backdrop-blur-md border-white/10 text-white' 
                : 'bg-white/95 backdrop-blur-md border-gray-200 text-gray-900'
            } relative overflow-hidden`}>
              {/* Active colored line decorative indicator */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#00B140] to-[#00ff5d]"></div>
              
              <div className="flex gap-3.5 items-start mt-1">
                {/* App Logo */}
                <img 
                  src="/app_logo.jpg" 
                  alt="M Phone Logo" 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-[#00B140]/30 shadow-md shadow-[#00B140]/10 shrink-0" 
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[15px] leading-tight">ดาวน์โหลด M Phone Shop</h4>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ติดตั้งแอปพลิเคชันลงบนมือถือของคุณเพื่อการใช้งานที่รวดเร็ว ประหยัดเน็ต และไม่เปลืองพื้นที่ในเครื่อง
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3.5">
                    <button
                      onClick={handleInstallClick}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00B140] hover:bg-[#009134] text-black text-xs font-bold rounded-lg transition duration-200 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      ติดตั้งทันที
                    </button>
                    <button
                      onClick={handleOpenGuide}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition duration-200 cursor-pointer ${
                        isDark 
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      คู่มือการติดตั้ง
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleDismiss}
                  className={`p-1 rounded-full transition duration-150 shrink-0 ${
                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Detailed Installation Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseGuide}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-lg z-10 rounded-2xl overflow-hidden shadow-2xl border ${
                isDark ? 'bg-[#151515] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              {/* Header */}
              <div className="relative p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#00B140]/10 rounded-xl text-[#00B140]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">คู่มือการติดตั้งแอปพลิเคชัน</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      เพิ่มแอป M Phone Shop ลงหน้าจอหลักของคุณเพื่อความเรียลไทม์
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseGuide}
                  className={`p-1.5 rounded-full transition duration-150 ${
                    isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs selector */}
              <div className={`flex p-1.5 gap-1.5 ${isDark ? 'bg-black/40' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                    activeTab === 'ios'
                      ? isDark ? 'bg-white/10 text-white border border-white/5' : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71,19.5 C17.88,20.74 17,21.95 15.66,21.97 C14.32,22 13.89,21.18 12.37,21.18 C10.84,21.18 10.37,21.95 9.1,22 C7.79,22.05 6.8,20.68 5.96,19.47 C4.25,17 2.94,12.45 4.7,9.39 C5.57,7.87 7.13,6.91 8.82,6.88 C10.1,6.86 11.32,7.75 12.11,7.75 C12.89,7.75 14.37,6.68 15.92,6.84 C16.57,6.87 18.39,7.1 19.56,8.82 C19.47,8.88 17.39,10.1 17.41,12.63 C17.44,15.65 20.06,16.66 20.1,16.67 C20.08,16.74 19.67,18.11 18.71,19.5 M15.97,4.17 C16.63,3.37 17.07,2.28 16.95,1 C16,1.04 14.9,1.6 14.24,2.38 C13.68,3.04 13.19,4.14 13.34,5.39 C14.39,5.47 15.4,4.88 15.97,4.17" />
                  </svg>
                  ติดตั้งบน iOS (iPhone / iPad)
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                    activeTab === 'android'
                      ? isDark ? 'bg-white/10 text-white border border-white/5' : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M16.63,16.4C16.15,16.4 15.75,16 15.75,15.53C15.75,15.05 16.15,14.65 16.63,14.65C17.11,14.65 17.5,15.05 17.5,15.53C17.5,16 17.11,16.4 16.63,16.4M7.37,16.4C6.89,16.4 6.5,16 6.5,15.53C6.5,15.05 6.89,14.65 7.37,14.65C7.85,14.65 8.25,15.05 8.25,15.53C8.25,16 7.85,16.4 7.37,16.4M16.9,11.57L18.4,9C18.5,8.8 18.44,8.55 18.24,8.45C18.04,8.35 17.8,8.4 17.7,8.6L16.17,11.23C14.9,10.65 13.5,10.3 12,10.3C10.5,10.3 9.1,10.65 7.83,11.23L6.3,8.6C6.2,8.4 5.96,8.35 5.76,8.45C5.56,8.55 5.5,8.8 5.6,9L7.1,11.57C4.15,13.18 2.18,16.13 2,19.66H22C21.82,16.13 19.85,13.18 16.9,11.57Z" />
                  </svg>
                  ติดตั้งบน Android (หรือ PC)
                </button>
              </div>

              {/* Instructions Panel */}
              <div className="p-6 max-h-[380px] overflow-y-auto space-y-5">
                {activeTab === 'ios' ? (
                  // iOS Safari instructions
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl border flex items-start gap-3 ${
                      isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <Compass className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed">
                        <strong className="text-sm block mb-0.5">โปรดเปิดใช้งานบนเบราว์เซอร์ Safari</strong>
                        ระบบ iOS ของ Apple จำเป็นต้องติดตั้งผ่าน Safari เท่านั้น หากเปิดในแอปอื่น (เช่น Line, Facebook, Messenger) ให้กดสัญลักษณ์มุมขวาเพื่อ "เปิดใน Safari" ก่อน
                      </p>
                    </div>

                    <div className="space-y-4 font-sans text-sm">
                      {/* Step 1 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">เปิดเว็บไซต์ในแอป Safari</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>เข้าไปที่หน้าเว็บไซต์ของ M Phone Shop ผ่าน Safari</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold flex items-center gap-1.5 flex-wrap">
                            กดปุ่มแชร์ <span className="inline-flex p-1 bg-[#00B140]/10 text-[#00B140] rounded-md"><Share className="w-3.5 h-3.5" /></span> ด้านล่างสุดของจอ
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>สัญลักษณ์สี่เหลี่ยมที่มีลูกศรชี้ขึ้นตรงกึ่งกลางด้านล่าง</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold flex items-center gap-1.5 flex-wrap">
                            เลือกเมนู <span className="text-[#00B140] underline flex items-center gap-1">"เพิ่มลงในหน้าจอโฮม"</span> <PlusSquare className="w-4 h-4" />
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>เลื่อนเมนูแชร์ขึ้นด้านบนจนพบปุ่ม "เพิ่มลงในหน้าจอโฮม" (Add to Home Screen)</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">กดปุ่ม "เพิ่ม" (Add) มุมขวาบน</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>เสร็จสิ้น! แอปจะปรากฏเป็นไอคอนบนหน้าจอโทรศัพท์ของท่านทันทีเหมือนแอปทั่วไป</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Android / Chrome instructions
                  <div className="space-y-4">
                    {deferredPrompt && (
                      <div className="mb-2">
                        <button
                          onClick={handleInstallClick}
                          className="w-full py-3 bg-[#00B140] hover:bg-[#009134] text-black text-sm font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#00B140]/20"
                        >
                          <Download className="w-4 h-4" />
                          กดเพื่อติดตั้งลงเครื่องทันที (คลิกเดียว)
                        </button>
                      </div>
                    )}

                    <div className="space-y-4 font-sans text-sm">
                      {/* Step 1 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          1
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">เปิดเบราว์เซอร์ Google Chrome</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>เปิดเว็บนี้ด้วย Chrome เพื่อการรองรับฟีเจอร์แอปเต็มรูปแบบ</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          2
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            กดปุ่มสัญลักษณ์เมนู <MoreVertical className="w-4 h-4 text-[#00B140]" /> มุมขวาบนสุด
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>หรือสัญลักษณ์จุดสามจุดที่มุมขวาบนของ Google Chrome</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          3
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold flex items-center gap-1.5">
                            เลือก <span className="text-[#00B140] underline font-bold">"ติดตั้งแอป"</span> หรือ <span className="text-[#00B140] underline font-bold">"เพิ่มลงในหน้าจอหลัก"</span>
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>คำว่า "ติดตั้งแอป" (Install) จะปรากฏขึ้นในรายการตัวเลือก</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00B140]/15 text-[#00B140] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          4
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold">กดตกลง "ติดตั้ง"</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>รอระบบประมวลผล 2 วินาที ไอคอนแอปจะไปปรากฏบนหน้าจอมือถือของคุณทันที</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/10">
                <div className="flex items-center gap-1.5 text-xs text-[#00B140] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  รองรับฟีเจอร์แจ้งเตือนแบบเรียลไทม์
                </div>
                <button
                  onClick={handleCloseGuide}
                  className="px-4 py-2 bg-[#00B140] hover:bg-[#009134] text-black text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
