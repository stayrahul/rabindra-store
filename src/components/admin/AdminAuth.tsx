"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Lock, ArrowRight, Loader2, AlertTriangle, 
  Fingerprint, Terminal, KeyRound, Eye, EyeOff, Server, Globe
} from "lucide-react";
import { supabase } from "@/utils/supabase";

const EXPIRY_TIME_MS = 10 * 60 * 1000; // 10 Minutes
const LOCKOUT_TIME_MS = 60 * 1000; // 60 Second lockout
const MAX_ATTEMPTS = 3;

// Terminal simulation sequence for immersive UX
const TERMINAL_STEPS = [
  "Initiating secure handshake...",
  "Verifying 256-bit encryption hash...",
  "Checking origin IP against whitelist...",
  "Decrypting admin payload...",
];

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  
  // Sequence states
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [terminalLog, setTerminalLog] = useState("");
  const [shake, setShake] = useState(false);
  
  // Security States
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);

  // 1. Initial Session Check & Lockout Verification
  useEffect(() => {
    const checkAuth = () => {
      // Check Lockout
      const lockoutStr = localStorage.getItem("admin_lockout_timestamp");
      if (lockoutStr) {
        const lockoutTime = parseInt(lockoutStr, 10);
        if (Date.now() < lockoutTime) {
          setLockoutUntil(lockoutTime);
        } else {
          localStorage.removeItem("admin_lockout_timestamp");
          setAttempts(0);
        }
      }

      // Check Session Auth
      const loginTime = sessionStorage.getItem("admin_auth_timestamp");
      if (loginTime) {
        const timeElapsed = Date.now() - parseInt(loginTime, 10);
        if (timeElapsed < EXPIRY_TIME_MS) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("admin_auth_timestamp");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };

    checkAuth();
    const intervalId = setInterval(checkAuth, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // 2. Lockout Countdown Engine
  useEffect(() => {
    if (!lockoutUntil) return;
    
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining === 0) {
        setLockoutUntil(null);
        setAttempts(0);
        localStorage.removeItem("admin_lockout_timestamp");
      }
    };
    
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  // 3. Login Authentication Sequence (DYNAMIC DB CHECK)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || lockoutUntil) return;

    setIsLoading(true);
    setError(false);
    
    // Immersive Terminal Sequence
    let step = 0;
    setTerminalLog(TERMINAL_STEPS[0]);

    // FETCH DYNAMIC PASSWORD FROM SUPABASE
    let VALID_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "rabindra115";
    try {
      const { data } = await supabase.from('store_settings').select('data').single();
      if (data?.data?.adminPassword) {
        VALID_PASSWORD = data.data.adminPassword;
      }
    } catch (err) {
      console.warn("Could not fetch password from DB, using fallback.");
    }
    
    const interval = setInterval(() => {
      step++;
      if (step < TERMINAL_STEPS.length) {
        setTerminalLog(TERMINAL_STEPS[step]);
      } else {
        clearInterval(interval);
        
        // Execute Verification against the database password
        if (password === VALID_PASSWORD) {
          setTerminalLog("Access Granted. Routing to dashboard...");
          setTimeout(() => {
            sessionStorage.setItem("admin_auth_timestamp", Date.now().toString());
            setAttempts(0);
            setIsAuthenticated(true);
          }, 600);
        } else {
          handleFailedAttempt();
        }
      }
    }, 450); // Speed of terminal updates
  };

  const handleFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_TIME_MS;
      setLockoutUntil(lockoutTime);
      localStorage.setItem("admin_lockout_timestamp", lockoutTime.toString());
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setPassword("");
    setIsLoading(false);
    setTerminalLog("");
  };

  // --- RENDERERS ---

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-indigo-400 font-mono tracking-widest uppercase animate-pulse">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const isLocked = lockoutUntil !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden px-4 font-sans selection:bg-indigo-500/30 text-slate-300">
      
      {/* Immersive Cyber Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15)_0,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative p-8 sm:p-10 rounded-[2.5rem] max-w-[440px] w-full z-10 border transition-colors duration-500 bg-slate-950/60 backdrop-blur-2xl shadow-2xl ${
          isLocked ? "border-rose-500/30 shadow-[0_0_50px_-12px_rgba(244,63,94,0.2)]" : "border-slate-800 shadow-[0_0_50px_-12px_rgba(79,70,229,0.15)]"
        }`}
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6 group">
            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-40 transition-colors duration-500 ${isLocked ? 'bg-rose-500' : 'bg-indigo-600 group-hover:opacity-60'}`} />
            <div className={`w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-inner relative z-10 border transition-colors duration-500 ${isLocked ? 'border-rose-500/50' : 'border-indigo-500/30'}`}>
              {isLocked ? (
                <AlertTriangle className="text-rose-500 w-7 h-7" strokeWidth={1.5} />
              ) : (
                <ShieldAlert className="text-indigo-400 w-7 h-7" strokeWidth={1.5} />
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center z-20 ${isLocked ? 'bg-rose-500' : 'bg-emerald-500'}`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tight text-center">
            {isLocked ? "System Locked" : "Master Control"}
          </h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] text-center mt-2 flex items-center justify-center gap-1.5">
            <Fingerprint size={12} className={isLocked ? "text-rose-500" : "text-indigo-500"} /> 
            Rabindra Enterprise
          </p>
        </div>
        
        {/* LOCKOUT UI OR LOGIN FORM */}
        {isLocked ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="bg-rose-950/30 border border-rose-500/20 p-5 rounded-2xl w-full">
              <p className="text-rose-400 text-sm font-bold mb-1">Brute-force protection engaged.</p>
              <p className="text-rose-300/70 text-xs font-medium">Access is temporarily restricted to protect server integrity.</p>
            </div>
            <div className="flex items-end justify-center gap-2 text-white bg-slate-900/50 py-6 w-full rounded-2xl border border-slate-800">
              <span className="text-5xl font-black tabular-nums leading-none tracking-tighter text-rose-500">{lockoutCountdown}</span>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Seconds</span>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-6"
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Decryption Key
                </label>
                {attempts > 0 && (
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle size={10} /> {MAX_ATTEMPTS - attempts} Attempts Left
                  </span>
                )}
              </div>
              <div className="relative flex items-center group">
                <KeyRound className="absolute left-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter access code..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-12 pr-12 py-4 bg-slate-900/50 rounded-2xl border border-slate-800 focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white font-bold placeholder:text-slate-700 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 text-slate-500 hover:text-white transition-colors disabled:opacity-50 outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoading && terminalLog ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 text-indigo-400 text-[11px] font-mono bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-500/20">
                    <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                    <span>{terminalLog}</span>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 text-rose-400 text-xs font-bold bg-rose-950/30 p-3.5 rounded-xl border border-rose-500/20 uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Key Rejected. Incident Logged.</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isLoading || !password}
              className="group relative w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="tracking-wide">Authenticating...</span>
              ) : (
                <>
                  <span className="tracking-wide">Authorize Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* FOOTER METRICS */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Connection</span>
              <span className="text-[10px] font-medium text-slate-400">AES-256 Encrypted</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Origin Node</span>
              <span className="text-[10px] font-medium text-slate-400">Bagmati, NP</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}