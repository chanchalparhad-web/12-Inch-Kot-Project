import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Printer, Zap, X, Share, PlusSquare } from 'lucide-react';

interface InstallAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone/PWA installed mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capture Chrome/Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed previously
      const hasDismissed = localStorage.getItem('12inch_pwa_dismissed');
      if (!hasDismissed) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not dismissed yet, show on first visit
    if (isAppleDevice && !checkStandalone) {
      const hasDismissed = localStorage.getItem('12inch_pwa_dismissed');
      if (!hasDismissed) {
        // Small delay so user sees the app first
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync with controlled prop if provided
  useEffect(() => {
    if (typeof controlledIsOpen === 'boolean') {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('12inch_pwa_dismissed', 'true');
    if (controlledOnClose) {
      controlledOnClose();
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User installed the PWA app');
      }
      setDeferredPrompt(null);
      handleClose();
    } else if (isIOS) {
      // Just keep instructions visible
    } else {
      handleClose();
    }
  };

  if (isStandalone || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/logo.png"
                alt="12 Inch Fries App"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/30"
              />
              <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow">
                POS
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight leading-tight">
                Install 12 Inch Fries App
              </h3>
              <p className="text-xs text-yellow-400 font-medium">
                Faster mobile billing &amp; instant printer access
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 text-xs">
          <div className="flex items-center gap-3 text-zinc-200">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Full-Screen Mobile POS</span>
              <span className="text-[11px] text-zinc-400">No browser address bar for distraction-free billing</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-200">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Direct Bluetooth Printing</span>
              <span className="text-[11px] text-zinc-400">Instant connection to 58mm thermal printers</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-200">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Quick 1-Tap Home Screen Access</span>
              <span className="text-[11px] text-zinc-400">Works like a native Android &amp; iOS application</span>
            </div>
          </div>
        </div>

        {/* Platform Specific Action */}
        {isIOS ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2 text-xs text-amber-200">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>🍎</span> How to install on your iPhone / iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300">
              <li className="flex items-center gap-2">
                <span>1. Tap the Share button</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold flex items-center gap-1">
                  <Share className="w-3 h-3 text-blue-400" /> Share
                </span>
                <span>in Safari's bottom bar</span>
              </li>
              <li className="flex items-center gap-2">
                <span>2. Scroll down and tap</span>
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold flex items-center gap-1">
                  <PlusSquare className="w-3 h-3 text-yellow-400" /> Add to Home Screen
                </span>
              </li>
              <li>3. Tap <strong>Add</strong> in the top-right corner</li>
            </ol>
            <button
              onClick={handleClose}
              className="w-full mt-2 py-2 rounded-xl bg-zinc-800 text-white text-xs font-bold"
            >
              Got it, close
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-sm shadow-xl shadow-yellow-500/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Install App on Phone
            </button>

            <button
              onClick={handleClose}
              className="w-full py-2.5 text-center text-xs text-zinc-400 hover:text-white transition"
            >
              Maybe Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
