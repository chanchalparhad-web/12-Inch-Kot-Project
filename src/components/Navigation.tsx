import React, { useState } from 'react';
import { Home, ShoppingBag, BarChart3, Menu, Package, Users, Receipt, Printer, Settings, LogOut, X } from 'lucide-react';

export type NavTab = 'home' | 'billing' | 'reports' | 'products' | 'customers' | 'sales' | 'expenses' | 'printer' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
  lowStockCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'billing' as NavTab, label: 'Billing', icon: ShoppingBag, highlight: true },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
  ];

  const moreItems = [
    { id: 'products' as NavTab, label: 'Products', icon: Package },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    { id: 'sales' as NavTab, label: 'Sales History', icon: Receipt },
    { id: 'expenses' as NavTab, label: 'Expenses', icon: BarChart3 },
    { id: 'printer' as NavTab, label: 'Printer (SRS588)', icon: Printer },
    { id: 'settings' as NavTab, label: 'Business Setup', icon: Settings },
  ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar for Touch/Mobile & Quick Access */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-zinc-800/80 px-2 py-1.5 shadow-2xl backdrop-blur-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                  tab.highlight
                    ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20 -translate-y-1 py-2 px-4'
                    : isActive
                    ? 'text-yellow-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={tab.highlight ? 'w-5 h-5' : 'w-5 h-5 mb-0.5'} />
                <span className={`text-[11px] ${tab.highlight ? 'text-black' : ''}`}>{tab.label}</span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              ['products', 'customers', 'sales', 'expenses', 'printer', 'settings'].includes(activeTab)
                ? 'text-yellow-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5 mb-0.5" />
            </div>
            <span className="text-[11px]">More</span>
          </button>
        </div>
      </nav>

      {/* More Drawer / Menu Modal */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Menu className="w-5 h-5 text-yellow-500" />
                More Features
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 font-semibold'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-zinc-800 text-yellow-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowMoreMenu(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              Logout from BillPro
            </button>
          </div>
        </div>
      )}
    </>
  );
};
