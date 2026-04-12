"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Megaphone, Info, AlertTriangle, CheckCircle } from "lucide-react";

interface Broadcast {
  id: string;
  type: "info" | "warning" | "success" | "maintenance";
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  dismissible?: boolean;
  timestamp: number;
}

// Default broadcasts - in production, this could come from an API
const DEFAULT_BROADCASTS: Broadcast[] = [
  {
    id: "welcome",
    type: "info",
    title: "Welcome to DevPack",
    message: "Verify your GitHub Student Developer Pack status easily.",
    dismissible: true,
    timestamp: Date.now(),
  },
];

// Storage key for dismissed broadcasts
const DISMISSED_KEY = "devpack-dismissed-broadcasts";
const BROADCASTS_KEY = "devpack-broadcasts";

export function useBroadcasts() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load dismissed broadcasts from localStorage
    try {
      const dismissed = localStorage.getItem(DISMISSED_KEY);
      if (dismissed) {
        setDismissedIds(JSON.parse(dismissed));
      }

      // Load custom broadcasts from localStorage (for admin purposes)
      const customBroadcasts = localStorage.getItem(BROADCASTS_KEY);
      if (customBroadcasts) {
        const parsed = JSON.parse(customBroadcasts);
        setBroadcasts(parsed);
      } else {
        setBroadcasts(DEFAULT_BROADCASTS);
      }
    } catch {
      setBroadcasts(DEFAULT_BROADCASTS);
    }
    setIsLoaded(true);
  }, []);

  const dismissBroadcast = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addBroadcast = useCallback((broadcast: Omit<Broadcast, "id" | "timestamp">) => {
    const newBroadcast: Broadcast = {
      ...broadcast,
      id: `broadcast-${Date.now()}`,
      timestamp: Date.now(),
    };

    setBroadcasts((prev) => {
      const updated = [newBroadcast, ...prev];
      localStorage.setItem(BROADCASTS_KEY, JSON.stringify(updated));
      return updated;
    });

    // Reset dismissal for new broadcasts
    setDismissedIds((prev) => {
      const updated = prev.filter((id) => id !== newBroadcast.id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });

    return newBroadcast.id;
  }, []);

  const removeBroadcast = useCallback((id: string) => {
    setBroadcasts((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem(BROADCASTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllBroadcasts = useCallback(() => {
    setBroadcasts([]);
    localStorage.removeItem(BROADCASTS_KEY);
  }, []);

  const activeBroadcasts = broadcasts.filter(
    (b) => !dismissedIds.includes(b.id)
  );

  return {
    broadcasts: activeBroadcasts,
    allBroadcasts: broadcasts,
    isLoaded,
    dismissBroadcast,
    addBroadcast,
    removeBroadcast,
    clearAllBroadcasts,
  };
}

const typeStyles: Record<
  Broadcast["type"],
  { icon: typeof Info; colors: string }
> = {
  info: {
    icon: Info,
    colors:
      "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    colors:
      "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-100",
  },
  success: {
    icon: CheckCircle,
    colors:
      "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-800 dark:text-green-100",
  },
  maintenance: {
    icon: Megaphone,
    colors:
      "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-800 dark:text-red-100",
  },
};

interface BroadcastNotificationProps {
  broadcast: Broadcast;
  onDismiss: () => void;
}

function BroadcastItem({ broadcast, onDismiss }: BroadcastNotificationProps) {
  const { icon: Icon, colors } = typeStyles[broadcast.type];

  return (
    <div
      className={`rounded-xl border p-4 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 ${colors}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{broadcast.title}</h3>
          <p className="text-sm mt-1 opacity-90">{broadcast.message}</p>
          {broadcast.link && (
            <a
              href={broadcast.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm font-medium underline hover:opacity-80"
            >
              {broadcast.linkText || "Learn more"}
            </a>
          )}
        </div>
        {broadcast.dismissible !== false && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

interface BroadcastContainerProps {
  className?: string;
}

export function BroadcastContainer({ className = "" }: BroadcastContainerProps) {
  const { broadcasts, isLoaded, dismissBroadcast } = useBroadcasts();

  if (!isLoaded || broadcasts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {broadcasts.map((broadcast) => (
        <BroadcastItem
          key={broadcast.id}
          broadcast={broadcast}
          onDismiss={() => dismissBroadcast(broadcast.id)}
        />
      ))}
    </div>
  );
}

// Admin component for managing broadcasts
interface BroadcastManagerProps {
  onClose?: () => void;
}

export function BroadcastManager({ onClose }: BroadcastManagerProps) {
  const { allBroadcasts, addBroadcast, removeBroadcast, clearAllBroadcasts } =
    useBroadcasts();
  const [type, setType] = useState<Broadcast["type"]>("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [linkText, setLinkText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addBroadcast({
      type,
      title: title.trim(),
      message: message.trim(),
      link: link.trim() || undefined,
      linkText: linkText.trim() || undefined,
      dismissible: true,
    });

    setTitle("");
    setMessage("");
    setLink("");
    setLinkText("");
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Broadcast Notifications
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Add New Broadcast */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Broadcast["type"])}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Link URL (optional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Link Text (optional)
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Learn more..."
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !message.trim()}
          className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Broadcast Notification
        </button>
      </form>

      {/* Existing Broadcasts */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Active Broadcasts
          </h3>
          {allBroadcasts.length > 0 && (
            <button
              onClick={clearAllBroadcasts}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="space-y-2">
          {allBroadcasts.map((broadcast) => {
            const { icon: Icon, colors } = typeStyles[broadcast.type];
            return (
              <div
                key={broadcast.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 ${colors.replace(
                      "border-",
                      ""
                    )}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {broadcast.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {broadcast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeBroadcast(broadcast.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
          {allBroadcasts.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
              No active broadcasts
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
