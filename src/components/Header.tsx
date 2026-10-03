import React from 'react';
import type { Business, PrinterDevice, User } from '../types/billpro';
import { Printer, LogOut, Settings, Database } from 'lucide-react';

interface HeaderProps {
  business: Business;
  user: User;
  printer: PrinterDevice;
  isBackendConnected?: boolean;
  onOpenPrinter: () => void;
  onOpenBusinessSetup: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  user,
  printer,
  isBackendConnected = true,
  onOpenPrinter,
  onOpenBusinessSetup,
  onLogout,
}) => {
  const getPrinterBadge = () => {
    switch (printer.status) {
      case 'CONNECTED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CONNECTING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse';
      case 'ERROR':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800/80 px-4 py-3 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Business Info */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="12 Inch Fries Logo"
            className="w-10 h-10 rounded-xl object-cover border border-yellow-500/30 shadow-md shadow-yellow-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white leading-none tracking-tight flex items-center gap-1.5">
                {business.name || 'BillPro'}
              </h1>
              {business.gstEnabled && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  GST
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[180px] sm:max-w-xs">
              {business.city ? `${business.city}, ${business.state}` : 'Smart Billing POS'}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Backend PostgreSQL Connection Status Badge */}
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
              isBackendConnected
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
            title={isBackendConnected ? 'PostgreSQL & Spring Boot Connected' : 'Local Storage Mode'}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {isBackendConnected ? 'PostgreSQL Active' : 'Offline Mode'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendConnected ? 'bg-blue-400 animate-pulse' : 'bg-zinc-500'
              }`}
            />
          </div>

          {/* Printer Connection Badge */}
          <button
            onClick={onOpenPrinter}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all hover:brightness-110 active:scale-95 ${getPrinterBadge()}`}
            title="SHREYANS SRS588 Printer Settings"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{printer.name}</span>
            <span className="w-2 h-2 rounded-full bg-current" />
          </button>

          {/* Business Settings Icon */}
          <button
            onClick={onOpenBusinessSetup}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            title="Business Setup & Config"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-200">{user.name}</p>
              <p className="text-[10px] text-zinc-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
