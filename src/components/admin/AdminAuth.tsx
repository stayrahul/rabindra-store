"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Lock, ArrowRight, Loader2, AlertTriangle, Fingerprint, Terminal, KeyRound } from "lucide-react";

const EXPIRY_TIME_MS = 10 * 60 * 1000; // 10 Minutes
const LOCKOUT_TIME_MS = 60 * 1000; // 60 Second lockout after 3 failed attempts
const MAX_ATTEMPTS = 3;

export default function AdminAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [shake, setShake] = useState(false);
  
  // Security States
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [terminalLog, setTerminalLog] = useState("");

  // Check initial session & lockout status
  useEffect(() => {
    const checkAuth = () => {
      // 1. Check Lockout
      const lockoutStr = localStorage.getItem("adminLockout");
      if (lockoutStr) {
        const lockoutTime = parseInt(lockoutStr, 10);
        if (Date.now() < lockoutTime) {
          setLockoutUntil(lockoutTime);
        } else {
          localStorage.removeItem("adminLockout");
          setAttempts(0);
        }
      }

      // 2. Check Auth Session
      const loginTime = sessionStorage.getItem("adminAuthTime");
      if (loginTime) {
        const timeElapsed = Date.now() - parseInt(loginTime, 10);
        if (timeElapsed < EXPIRY_TIME_MS) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("adminAuthTime");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsChecking(false);
    };

    checkAuth();
    const intervalId = setInterval(checkAuth, 10000); // Check every 10s
    return () => clearInterval(intervalId);
  }, []);

  // Handle Lockout Countdown Timer
  useEffect(() => {
    if (!lockoutUntil) return;
    
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining === 0) {
        setLockoutUntil(null);
        setAttempts(0);
        localStorage.removeItem("adminLockout");
      }
    };
    
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || lockoutUntil) return;

    setIsLoading(true);
    setError(false);
    
    // Simulate Terminal Activity
    setTerminalLog("Establishing secure connection...");
    setTimeout(() => setTerminalLog("Verifying encrypted hash..."), 400);
    setTimeout(() => setTerminalLog("Checking IP origin flags..."), 800);

    setTimeout(() => {
      if (password === "rabindra115") {
        setTerminalLog("Access Granted. Decrypting payload...");
        setTimeout(() => {
          sessionStorage.setItem("adminAuthTime", Date.now().toString());
          setAttempts(0);
          setIsAuthenticated(true);
        }, 500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_TIME_MS;
          setLockoutUntil(lockoutTime);
          localStorage.setItem("adminLockout", lockoutTime.toString());
          setError(false); // Hide standard error in favor of lockout UI
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => setShake(false), 500);
        }
        
        setPassword("");
        setIsLoading(false);
        setTerminalLog("");
      }
    }, 1200);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const isLocked = lockoutUntil !== null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 font-sans selection:bg-indigo-500/30 text-slate-300">
      
      {/* Deep Vault Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08)_0,transparent_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`relative p-8 sm:p-10 rounded-[2rem] max-w-[420px] w-full z-10 border transition-colors duration-500 bg-slate-900/50 backdrop-blur-xl shadow-2xl ${
          isLocked ? "border-rose-500/30 shadow-rose-500/10" : "border-white/10 shadow-indigo-500/10"
        }`}
      >
        <div className="flex flex-col items-center mb-8">
          {/* Neon Icon Block */}
          <div className="relative mb-6">
            <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 animate-pulse ${isLocked ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-xl shadow-black relative z-10 border border-slate-800">
              {isLocked ? (
                <AlertTriangle className="text-rose-500 w-8 h-8" strokeWidth={1.5} />
              ) : (
                <ShieldAlert className="text-indigo-400 w-8 h-8" strokeWidth={1.5} />
              )}
            </div>
            {/* Status Dot */}
            <div className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center z-20 ${isLocked ? 'bg-rose-500' : 'bg-emerald-500'}`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tight text-center">
            {isLocked ? "System Locked" : "Level 4 Access"}
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1.5">
            <Fingerprint size={12} className={isLocked ? "text-rose-500" : "text-indigo-500"} /> 
            Rabindra Store Server
          </p>
        </div>
        
        {isLocked ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl w-full">
              <p className="text-rose-400 text-sm font-medium mb-1">Too many failed attempts.</p>
              <p className="text-rose-300 text-xs opacity-80">Security protocols initiated. Access is restricted.</p>
            </div>
            <div className="flex items-end gap-2 text-white">
              <span className="text-4xl font-black tabular-nums leading-none">{lockoutCountdown}</span>
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Seconds</span>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleLogin} 
            className="space-y-5"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Encryption Key
                </label>
                {attempts > 0 && (
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                    {MAX_ATTEMPTS - attempts} Attempts Left
                  </span>
                )}
              </div>
              <div className="relative flex items-center group">
                <KeyRound className="absolute left-4 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  placeholder="Enter access code..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 rounded-xl border border-slate-800 focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white font-bold placeholder:text-slate-700 placeholder:font-medium disabled:opacity-50"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoading && terminalLog ? (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-indigo-400 text-[11px] font-mono bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20"
                >
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span className="animate-pulse">{terminalLog}</span>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Key Rejected. Logged.</span>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isLoading || !password}
              className="group relative w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 overflow-hidden"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="tracking-wide">Authorize Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isLocked ? 'bg-rose-500' : 'bg-indigo-500'}`} />
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              End-to-End Encrypted
            </p>
          </div>
          <Lock className="w-3 h-3 text-slate-700" />
        </div>

      </motion.div>
    </div>
  );
}