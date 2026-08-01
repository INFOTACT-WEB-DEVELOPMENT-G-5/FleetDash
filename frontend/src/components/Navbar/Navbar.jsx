import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../services/api";
import API from "../../api/axios";
import socket from "../../services/socket";
import "./Navbar.css";

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Profile", icon: "👤", action: () => { setOpen(false); navigate("/profile"); } },
    { label: "Settings", icon: "⚙️", action: () => { setOpen(false); navigate("/settings"); } },
    { label: "Manage Users", icon: "👥", action: () => { setOpen(false); navigate("/users"); } },
    { label: "Role Info", icon: "🔑", action: () => { setOpen(false); alert(`Role: ${user.role || "Fleet Manager"}\nPermissions: Full access`); } },
    { label: "Logout", icon: "🚪", action: () => { setOpen(false); onLogout(); } }
  ];

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button className="profile-dropdown-toggle" onClick={() => setOpen(!open)}>
        <span style={{ fontSize: 12 }}>▼</span>
      </button>
      {open && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <div className="profile-avatar-large">👤</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name || "Admin"}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{user.email || "admin@fleetdash.com"}</div>
              <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{user.role || "Fleet Manager"}</div>
            </div>
          </div>
          <div className="profile-dropdown-divider" />
          {menuItems.map((item, index) => (
            <button key={index} className="profile-dropdown-item" onClick={item.action}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimer = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll({ limit: 10 });
      const data = res.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.warn("Using local notifications:", err.message);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      setUnreadCount(res.data.count || 0);
    } catch {
      // Silent fallback
    }
  }, []);

  // Global search with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await API.get(`/enterprise/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.results || []);
        setShowSearch(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    socket.on("notification", () => {
      fetchUnreadCount();
      fetchNotifications();
    });

    socket.on("vehicleUpdate", () => {
      fetchUnreadCount();
    });

    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearch(true);
      }
      // Escape to close search
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
      }
      // G then D → Dashboard
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        const handler = (e2) => {
          document.removeEventListener("keydown", handler);
          if (e2.key === "d") navigate("/dashboard");
          else if (e2.key === "v") navigate("/vehicles");
          else if (e2.key === "t") navigate("/trips");
          else if (e2.key === "a") navigate("/alerts");
        };
        document.addEventListener("keydown", handler);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      socket.off("notification");
      socket.off("vehicleUpdate");
    };
  }, [fetchNotifications, fetchUnreadCount, navigate]);

  const handleSearchSelect = (result) => {
    setShowSearch(false);
    setSearchQuery("");
    navigate(result.link);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert": return "🚨";
      case "maintenance": return "🔧";
      case "info": return "ℹ️";
      case "system": return "⚙️";
      case "driver": return "👤";
      case "fuel": return "⛽";
      default: return "🔔";
    }
  };

  const getNotificationColor = (severity) => {
    switch (severity) {
      case "critical": return { bg: "rgba(239,68,68,0.1)", text: "#ef4444", border: "#ef4444" };
      case "warning": return { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "#f59e0b" };
      case "success": return { bg: "rgba(34,197,94,0.1)", text: "#22c55e", border: "#22c55e" };
      default: return { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "#3b82f6" };
    }
  };

  const getSearchIcon = (type) => {
    switch (type) {
      case "vehicle": return "🚛";
      case "driver": return "👤";
      case "trip": return "🛣️";
      case "alert": return "🔔";
      case "maintenance": return "🔧";
      case "geofence": return "📍";
      case "incident": return "🚨";
      case "report": return "📄";
      default: return "🔍";
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-search" ref={searchRef} style={{ position: "relative" }}>
          <span className="search-icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search vehicles, drivers, trips... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSearch(true)}
          />
          {searching && <span style={{ fontSize: "12px", color: "#64748b" }}>Searching...</span>}
          {!searching && searchQuery && <span className="search-shortcut" style={{ cursor: "pointer" }} onClick={() => { setSearchQuery(""); setShowSearch(false); }}>✕</span>}
          {!searchQuery && <span className="search-shortcut">⌘K</span>}

          {showSearch && searchResults.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              background: "#1a2332", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              zIndex: 500, maxHeight: "400px", overflowY: "auto",
              animation: "slideDown 0.2s ease"
            }}>
              {searchResults.map((r, i) => (
                <div key={i} onClick={() => handleSearchSelect(r)} style={{
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px",
                  cursor: "pointer", borderBottom: i < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  transition: "background 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: "16px" }}>{getSearchIcon(r.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{r.label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{r.sublabel}</div>
                  </div>
                  <span style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>{r.type}</span>
                </div>
              ))}
            </div>
          )}

          {showSearch && searchQuery.trim().length >= 2 && searchResults.length === 0 && !searching && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
              background: "#1a2332", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px", boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              zIndex: 500, padding: "20px", textAlign: "center"
            }}>
              <div style={{ color: "#64748b", fontSize: "13px" }}>No results found for "{searchQuery}"</div>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-status">
          <span className="status-indicator"></span>
          All Systems Operational
        </div>
        <div className="navbar-notification" onClick={() => setShowNotifications(!showNotifications)} ref={notificationRef}>
          <span>🔔</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-panel-header">
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <button onClick={markAllRead} style={{
                  background: "none", border: "none", color: "#6366f1",
                  fontSize: 12, cursor: "pointer", fontWeight: 500
                }}>
                  Mark all read
                </button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const colors = getNotificationColor(notif.severity);
                    return (
                      <div
                        key={notif._id}
                        className={`notification-item ${!notif.read ? "unread" : ""}`}
                        onClick={() => markAsRead(notif._id)}
                        style={{
                          padding: "12px 16px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          cursor: "pointer",
                          borderLeft: `3px solid ${!notif.read ? colors.border : "transparent"}`,
                          background: !notif.read ? "rgba(255,255,255,0.02)" : "transparent",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: colors.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, flexShrink: 0
                        }}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, color: "#e2e8f0",
                            fontWeight: !notif.read ? 600 : 400,
                            lineHeight: 1.4
                          }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : "Just now"}
                          </div>
                        </div>
                        {!notif.read && (
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#6366f1", flexShrink: 0, marginTop: 4
                          }}></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="notification-panel-footer">
                <button onClick={() => { setShowNotifications(false); navigate("/alerts"); }} style={{
                  background: "none", border: "none", color: "#6366f1",
                  fontSize: 12, cursor: "pointer", fontWeight: 500, width: "100%", padding: 10
                }}>
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="navbar-user" style={{ position: "relative" }}>
          <span className="user-avatar">👤</span>
          <div>
            <div className="user-name">{user.name || "Admin"}</div>
            <div className="user-role">{user.role || "Fleet Manager"}</div>
          </div>
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
}

export default Navbar;