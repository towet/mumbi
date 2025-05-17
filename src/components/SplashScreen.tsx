import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [showExitAnimation, setShowExitAnimation] = useState(false);

  useEffect(() => {
    // Trigger content animation after 500ms
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    // Start exit animation after 2.5 seconds
    const exitTimer = setTimeout(() => {
      setShowExitAnimation(true);
    }, 2500);

    // Complete and remove splash screen after 3 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!showExitAnimation ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-farm-green/90 to-emerald-700 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {/* Decorative elements */}
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: Math.random() * 200 + 50,
                  height: Math.random() * 200 + 50,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: Math.random() * 0.5 + 0.5, 
                  opacity: Math.random() * 0.3 + 0.1,
                  x: Math.random() * 40 - 20,
                  y: Math.random() * 40 - 20,
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  delay: Math.random() * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            <AnimatePresence>
              {showContent && (
                <>
                  <motion.div
                    className="mb-4 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.2,
                      ease: "easeOut"
                    }}
                  >
                    <div className="h-40 w-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center p-2">
                      <img src="/Mumbi Farm Logo-01.png" alt="Mumbi Farm Logo" className="w-full h-full object-contain" />
                    </div>
                    <motion.div 
                      className="absolute inset-0 rounded-full"
                      initial={{ boxShadow: "0 0 0 0 rgba(255,255,255,0.3)" }}
                      animate={{ boxShadow: "0 0 0 20px rgba(255,255,255,0)" }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                    />
                  </motion.div>

                  <motion.h1 
                    className="text-4xl font-bold tracking-tight mb-2 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.4,
                      ease: "easeOut"
                    }}
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                      Mumbi Farm
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-sm text-emerald-100/80 max-w-[250px] text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5,
                      delay: 0.6,
                      ease: "easeOut"
                    }}
                  >
                    Smart Management for Your Farm
                  </motion.p>
                </>
              )}
            </AnimatePresence>

            <div className="h-1 w-40 bg-white/20 rounded-full overflow-hidden mt-6">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
