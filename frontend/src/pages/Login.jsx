import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Login.css";

function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const navigate = useNavigate();

    const handleLogin=async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError("");

        try{
            const response = await authAPI.login({email,password});
            const {token,user} = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");
        }
        catch(err){
            setError(err.response?.data?.message || "Login failed. Please try again.");
        }
        finally{
            setLoading(false);
        }
    };

    return(
        <div className="login-page">
            <form className="login-box" onSubmit={handleLogin}>
                <h2>🚛 FleetDash</h2>
                <p>Enterprise Fleet Management Platform</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                />

                {error && <p className="login-error">{error}</p>}

                <button disabled={loading}>
                    {loading ? "Authenticating..." : "Sign In"}
                </button>

                <div className="login-footer">
                    <p>Demo: admin@fleetdash.com / 123456</p>
                </div>
            </form>
        </div>
    );
}

export default Login;