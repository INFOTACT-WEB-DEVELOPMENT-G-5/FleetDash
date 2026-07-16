import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar(){
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { path: "/dashboard", label: "Dashboard", icon: "📊", section: "Main" },
        { path: "/command-center", label: "Command Center", icon: "🎯", section: "Main" },
        { path: "/map", label: "Live Fleet Map", icon: "🗺️", section: "Main" },
        
        { path: "/vehicles", label: "Vehicles", icon: "🚛", section: "Fleet" },
        { path: "/fleet-health", label: "Fleet Health", icon: "❤️", section: "Fleet" },
        { path: "/drivers", label: "Drivers", icon: "👤", section: "Fleet" },
        { path: "/trips", label: "Trips", icon: "🛣️", section: "Fleet" },
        
        { path: "/telemetry", label: "Telemetry", icon: "📡", section: "Monitoring" },
        { path: "/alerts", label: "Alerts", icon: "🔔", section: "Monitoring" },
        { path: "/geofence", label: "Geofence", icon: "📍", section: "Monitoring" },
        
        { path: "/maintenance", label: "Maintenance", icon: "🔧", section: "Operations" },
        { path: "/analytics", label: "Analytics", icon: "📈", section: "Operations" },
        { path: "/reports", label: "Reports", icon: "📄", section: "Operations" },
        
        { path: "/voice-ai", label: "AI Assistant", icon: "🤖", section: "Intelligence" },
        { path: "/settings", label: "Settings", icon: "⚙️", section: "System" },
    ];

    const isActive = (path) => location.pathname === path;

    const sections = [...new Set(menuItems.map(i => i.section))];

    return(
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
                <span className="logo-icon">🚛</span>
                {!collapsed && (
                    <>
                        <span className="logo-text">FleetDash</span>
                        <span className="logo-badge">PRO</span>
                    </>
                )}
            </div>

            <div className="menu">
                {sections.map(section => (
                    <div key={section}>
                        {!collapsed && <div className="sidebar-section">{section}</div>}
                        {menuItems.filter(i => i.section === section).map((item) => (
                            <div
                                key={item.path}
                                className={`menu-item ${isActive(item.path) ? "active" : ""}`}
                                onClick={() => navigate(item.path)}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                {!collapsed && (
                                    <>
                                        <span className="menu-label">{item.label}</span>
                                        {isActive(item.path) && <span className="menu-indicator"></span>}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                {!collapsed && (
                    <>
                        <div className="sidebar-status">
                            <span className="status-dot"></span>
                            System Online
                        </div>
                        <div className="sidebar-version">v3.0 Enterprise</div>
                    </>
                )}
                <div className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? '→' : '←'}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
