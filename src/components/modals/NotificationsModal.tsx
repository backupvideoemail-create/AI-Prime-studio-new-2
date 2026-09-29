/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { storageService, AppNotification } from '../../services/storageService';
import { Bell, X, CheckCheck, Sparkles, MessageCircle, Gift, ArrowRight } from 'lucide-react';
import { ScreenRoute } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteChange: (route: ScreenRoute) => void;
  notifications: AppNotification[];
  onNotificationsChange: (notifs: AppNotification[]) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onRouteChange,
  notifications,
  onNotificationsChange,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = storageService.markAllNotificationsRead();
    onNotificationsChange(updated);
  };

  const handleItemClick = (notif: AppNotification) => {
    const updated = storageService.markNotificationRead(notif.id);
    onNotificationsChange(updated);
    if (notif.actionRoute) {
      onClose();
      onRouteChange(notif.actionRoute as ScreenRoute);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'gift':
        return <Gift className="w-4 h-4 text-emerald-400" />;
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-pink-400" />;
      case 'generation':
        return <Sparkles className="w-4 h-4 text-[#d4af37]" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#0d1017] border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1b1712] border border-[#d4af37]/40 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-[#07080a] text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-gray-400 hover:text-[#fceda7] flex items-center gap-1 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Read all</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 items-start ${
                  notif.read
                    ? 'bg-white/[0.02] border-white/[0.04] text-gray-400 hover:bg-white/[0.04]'
                    : 'bg-[#141822] border-[#d4af37]/30 text-white shadow-lg hover:border-[#d4af37]/60'
                }`}
              >
                <div className="p-2 rounded-xl bg-white/[0.05] shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold truncate text-white">{notif.title}</h4>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  {notif.actionRoute && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-[#fceda7] font-semibold">
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom dismiss */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
