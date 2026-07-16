import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar(){
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [searchQuery, setSearchQuery] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/vehicles?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return(
        <div className="navbar">
            <div className="navbar-left">
                <form className="navbar-search" onSubmit={handleSearch}>
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search vehicles, drivers, trips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-shortcut">⌘K</span>
                </form>
            </div>

            <div className="navbar-right">
                <div className="navbar-status">
                    <span className="status-indicator"></span>
                    All Systems Operational
                </div>
                <div className="navbar-notification">
                    <span>🔔</span>
                    <span className="notification-badge">3</span>
                </div>
                <div className="navbar-user">
                    <span className="user-avatar">👤</span>
                    <div>
                        <div className="user-name">{user.name || "Admin"}</div>
                        <div className="user-role">{user.role || "Fleet Manager"}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Navbar;
