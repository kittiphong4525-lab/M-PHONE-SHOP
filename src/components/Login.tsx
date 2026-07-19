import React, { useState } from 'react';
import { MPhoneDatabase } from '../lib/db';
import { Member } from '../types';
import { Smartphone, Lock, Mail, AlertTriangle, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: (user: Member) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลผู้ใช้งาน');
      return;
    }

    try {
      // Login through our database online
      const user = await MPhoneDatabase.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    
    // Simulate reset link sent
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 3000);
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4 overflow-hidden py-12">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00B140]/10 blur-[120px] pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00B140]/5 blur-[100px] pulse-glow" style={{ animationDelay: '4s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00B140] to-[#00ff5d] flex items-center justify-center shadow-lg shadow-[#00B140]/30 mb-4 border border-white/10">
            <Smartphone className="w-9 h-9 text-black stroke-[2]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            M PHONE <span className="text-[#00B140]">SHOP</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-wide">PARTNER PORTAL • ระบบสมาชิกในเครือ</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#00B140] to-transparent"></div>
          
          <h2 className="text-xl font-semibold text-white mb-6 text-center">เข้าสู่ระบบเพื่อใช้งาน</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl flex items-start gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">อีเมลผู้ใช้งาน</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00B140] focus:ring-1 focus:ring-[#00B140] transition duration-200 text-base"
                  placeholder="name@partner.com"
                  id="email-input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-sm font-medium">รหัสผ่าน</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[#00B140] text-xs hover:underline focus:outline-none font-medium"
                  id="forgot-password-btn"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00B140] focus:ring-1 focus:ring-[#00B140] transition duration-200 text-base"
                  placeholder="••••••"
                  id="password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 bg-[#00B140] hover:bg-[#009134] text-black font-semibold rounded-xl tracking-wide shadow-lg shadow-[#00B140]/20 transition-all duration-300 active:scale-[0.98] mt-2 cursor-pointer"
              id="login-submit-btn"
            >
              เข้าสู่ระบบระบบสมาชิก
            </button>
          </form>
        </div>

        {/* System Version Display */}
        <p className="text-center text-gray-600 text-xs mt-8 font-mono">
          M Phone Shop Partner Portal v2.4.0-build • ระบบความปลอดภัยเฉพาะในเครือ
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#00B140]" />
              กู้คืนรหัสผ่านสมาชิก
            </h3>
            
            {forgotSuccess ? (
              <div className="space-y-3 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#00B140]/10 text-[#00B140] flex items-center justify-center mx-auto">
                  ✓
                </div>
                <p className="text-white font-medium">ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว!</p>
                <p className="text-xs text-gray-400">ระบบได้ส่งอีเมลคำแนะนำในการเปลี่ยนรหัสผ่านไปยัง {forgotEmail} แล้ว</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-sm text-gray-400">กรอกอีเมลสมาชิกที่ลงทะเบียนไว้ ระบบจะดำเนินการส่งลิงก์เพื่อตั้งค่ารหัสผ่านใหม่</p>
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="กรอกอีเมลของคุณ..."
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00B140]"
                    id="forgot-email-input"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                    id="forgot-cancel-btn"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-[#00B140] text-black font-semibold rounded-lg hover:bg-[#009134]"
                    id="forgot-submit-btn"
                  >
                    ส่งข้อมูล
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
