"use client"; // Required since we are now using state and animations

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TopBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-black text-white text-center py-2 px-2 sm:px-4 xl:px-0 overflow-hidden"
        >
          <div className="relative max-w-frame mx-auto flex items-center justify-center min-h-[24px]">
            <p className="text-xs sm:text-sm">
              Sign up and get 20% off your first order.{" "}
              <Link 
                href="/sign-up" 
                className="underline font-medium hover:text-gray-300 transition-colors"
              >
                Sign Up Now
              </Link>
            </p>
            <Button
              variant="ghost"
              className="hover:bg-white/20 absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit p-1 hidden sm:flex text-gray-400 hover:text-white transition-colors rounded-md"
              size="icon"
              type="button"
              aria-label="Close banner"
              onClick={() => setIsVisible(false)}
            >
              <X size={16} strokeWidth={2.5} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBanner;