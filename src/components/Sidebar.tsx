import React from 'react';
import {
  Home,
  ArrowLeftRight,
  Camera,
  Settings,
  ShieldCheck,
  Headphones,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'accounts', label: 'Accounts', icon: Home },
    { id: 'pay-transfer', label: 'Pay & transfer', icon: ArrowLeftRight },
    { id: 'deposit-checks', label: 'Deposit checks', icon: Camera },
    { id: 'account-services', label: 'Account services', icon: Settings },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'customer-service', label: 'Customer service', icon: Headphones },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container - Exact Chase Deep Navy #0B3968 */}
      <aside
        className={`fixed lg:sticky top-14 left-0 h-[calc(100vh-3.5rem)] w-56 bg-[#0B3968] text-white z-40 shrink-0 transition-transform duration-200 ease-in-out border-r border-[#092F56] flex flex-col justify-between select-none ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="py-3 px-2">
          <div className="flex items-center justify-between px-3 py-2 mb-2 lg:hidden">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">Menu</span>
            <button
              onClick={onCloseMobile}
              className="p-1 text-blue-200 hover:text-white rounded-md"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#0E447B] text-white font-semibold shadow-xs'
                      : 'text-blue-100 hover:bg-[#0E447B]/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
