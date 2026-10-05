import React from 'react';
import { X, Bell, Check, Sparkles, AlertTriangle, Truck, Info } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { 
    pushNotifications, 
    markNotificationsAsRead, 
    requestPushNotificationPermission 
  } = useStore();

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    await requestPushNotificationPermission();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white font-display text-base">
                Town Push Notifications
              </h3>
              <p className="text-xs text-slate-500">
                Live delivery & inventory updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Browser Permission Prompt Banner */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 flex items-center justify-between gap-3">
          <span className="text-slate-600 dark:text-slate-400">
            Get instant alerts when your rider departs or stock runs low.
          </span>
          <button
            onClick={handleEnablePush}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 whitespace-nowrap shadow-xs"
          >
            Enable Alerts
          </button>
        </div>

        {/* Notifications List */}
        <div className="mt-4 max-h-72 overflow-y-auto space-y-2 pr-1">
          {pushNotifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No notifications yet.
            </div>
          ) : (
            pushNotifications.map((notif) => {
              const isOrder = notif.type === 'order';
              const isStock = notif.type === 'stock';

              return (
                <div
                  key={notif.id}
                  className={`rounded-xl border p-3 text-xs transition-colors ${
                    notif.read 
                      ? 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900' 
                      : 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {isOrder ? (
                        <Truck className="h-4 w-4 text-emerald-600" />
                      ) : isStock ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {notif.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={markNotificationsAsRead}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
