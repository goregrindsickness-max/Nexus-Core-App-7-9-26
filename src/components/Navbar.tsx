import React, { useEffect } from 'react';
import { ShoppingCart, Bell } from 'lucide-react';
import { useChats } from '../hooks/useChats';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  cartCount?: number;
  userProfile?: any;
  onOpenCart?: () => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'feed',
  onTabChange,
  cartCount = 0,
  userProfile,
  onOpenCart,
  onOpenNotifications,
}) => {
  const { totalUnreadCount, refetch } = useChats();

  useEffect(() => {
    const syncUnreadCount = () => {
      refetch();
    };

    window.addEventListener('nexus_chats_updated', syncUnreadCount);
    window.addEventListener('nexus_chat_read', syncUnreadCount);
    window.addEventListener('nexus_all_read', syncUnreadCount);

    return () => {
      window.removeEventListener('nexus_chats_updated', syncUnreadCount);
      window.removeEventListener('nexus_chat_read', syncUnreadCount);
      window.removeEventListener('nexus_all_read', syncUnreadCount);
    };
  }, [refetch]);

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onTabChange?.('feed')} 
          className="flex items-center gap-2 text-left cursor-pointer focus:outline-none"
        >
          <span className="font-extrabold text-lg text-white tracking-wider">
            NEXUS<span className="text-rose-500">CORE</span>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-full transition-all cursor-pointer"
          title="Shopping Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-lg">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
