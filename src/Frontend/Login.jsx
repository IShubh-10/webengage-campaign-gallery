import React, { useState, useEffect } from "react";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CampaignGallery from "./CampaignGallery";

const Login = () => {
    const [adminUsers, setAdminUsers] = useState([]);
    const [viewGuest, setViewGuest] = useState(false);

    // DB values
    const [dbUsername, setDbUsername] = useState("");
    const [dbPassword, setDbPassword] = useState("");

    // Input values
    const [username, setUsername] = useState("");
    const [password, setUserPassword] = useState("");

    const [message, setMessage] = useState("");

    // login
    const [isLogedIn, setisLogedIn] = useState(false);

    // password toggle
    const [showPassword, setShowPassword] = useState(false);

    const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

    // ================= FETCH ADMIN USERS =================
    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch(ADMIN_API_URL);
            const data = await response.json();

            setAdminUsers(data);

            if (data.length > 0) {
                setDbUsername(data[0].username);
                setDbPassword(data[0].userpassword);
            }
        } catch (error) {
            console.error("❌ Error fetching:", error);
        }
    };

    // ================= LOGIN =================
    const handleLogin = () => {
        if (username === dbUsername && password === dbPassword) {
            setMessage("Login successful");
            setisLogedIn(true);
            localStorage.setItem("isLogedIn", true);
        } else {
            setMessage("Invalid username or password");
            setisLogedIn(false);
            localStorage.setItem("isLogedIn", false);
        }
    };

    const handleGuest = () => {
        setViewGuest(true);
        localStorage.setItem("isGuestUser", true);
    };

    const guestUser = localStorage.getItem("isGuestUser");

    if (viewGuest || (guestUser && guestUser !== "false")) {
        return <CampaignGallery />;
    }

    const loginState = localStorage.getItem("isLogedIn");

    if ((isLogedIn || loginState) && loginState !== "false") {
        return <CampaignGallery />;
    }

    return (
        <>
            <style>
                {`
                *{
                    margin:0;
                    padding:0;
                    box-sizing:border-box;
                    font-family:Inter, sans-serif;
                }

                body{
                    background:#f4f7fb;
                    color:#111827;
                }

                .login-container{
                    width:100%;
                    min-height:100vh;
                    display:flex;
                    background:#f4f7fb;
                }

                /* ================= LEFT PANEL ================= */

                .login-left{
                    width:46%;
                    background:#ffffff;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:60px 70px;
                    border-right:1px solid #e5e7eb;
                }

                .login-content{
                    width:100%;
                    max-width:420px;
                }

                .brand{
                    display:flex;
                    align-items:center;
                    gap:14px;
                    margin-bottom:50px;
                }

                .brand-logo{
                    width:48px;
                    height:48px;
                    border-radius:14px;
                    // background:linear-gradient(135deg,#5B3DF5,#7C66FF);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#fff;
                    font-size:18px;
                    font-weight:700;
                    box-shadow:0 10px 25px rgba(91,61,245,0.25);
                }

                .brand-text{
                    font-size:24px;
                    font-weight:700;
                    color:#111827;
                    letter-spacing:-0.4px;
                }

                .welcome-title{
                    font-size:44px;
                    line-height:1.1;
                    font-weight:800;
                    color:#111827;
                    margin-bottom:18px;
                    letter-spacing:-1px;
                }

                .subtitle{
                    font-size:16px;
                    color:#6b7280;
                    line-height:1.8;
                    margin-bottom:40px;
                }

                .input-group{
                    margin-bottom:22px;
                    position:relative;
                }

                .input-group label{
                    display:block;
                    margin-bottom:10px;
                    font-size:14px;
                    font-weight:600;
                    color:#374151;
                }

                .input-group input{
                    width:100%;
                    height:58px;
                    border-radius:14px;
                    border:1px solid #dce3ec;
                    background:#fbfcfe;
                    padding:0 18px;
                    font-size:15px;
                    color:#111827;
                    transition:all 0.25s ease;
                    outline:none;
                }

                .input-group input:focus{
                    border-color:#5B3DF5;
                    background:#fff;
                    box-shadow:0 0 0 4px rgba(91,61,245,0.08);
                }

                .eye-icon{
                    position:absolute;
                    right:18px;
                    top:47px;
                    cursor:pointer;
                    font-size:18px;
                    opacity:0.7;
                }

                .login-btn{
                    width:100%;
                    height:58px;
                    border:none;
                    border-radius:14px;
                    background:linear-gradient(135deg, #4d47b3, #583892);
                    color:#fff;
                    font-size:16px;
                    font-weight:700;
                    cursor:pointer;
                    transition:all 0.25s ease;
                    margin-top:8px;
                    box-shadow:0 14px 28px rgba(91,61,245,0.22);
                }

                .login-btn:hover{
                    transform:translateY(-1px);
                    opacity:0.96;
                }

                .guest-btn{
                    width:100%;
                    height:56px;
                    margin-top:16px;
                    border-radius:14px;
                    border:1px solid #dce3ec;
                    background:#fff;
                    color:#374151;
                    font-size:15px;
                    font-weight:600;
                    cursor:pointer;
                    transition:0.25s ease;
                }

                .guest-btn:hover{
                    background:#f9fafb;
                }

                .message{
                    margin-top:22px;
                    text-align:center;
                    font-size:14px;
                    font-weight:600;
                    color:#4b5563;
                }

                /* ================= RIGHT PANEL ================= */

                .login-right{
                    width:54%;
                    background:
                        radial-gradient(circle at top right, rgba(124,102,255,0.18), transparent 30%),
                        linear-gradient(135deg,#0f172a,#111827);
                    padding:60px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    position:relative;
                    overflow:hidden;
                }

                .dashboard-wrapper{
                    width:100%;
                    max-width:560px;
                    position:relative;
                    z-index:2;
                }

                .dashboard-badge{
                    display:inline-flex;
                    align-items:center;
                    gap:8px;
                    padding:8px 14px;
                    border-radius:999px;
                    background:rgba(255,255,255,0.08);
                    border:1px solid rgba(255,255,255,0.08);
                    color:#c7d2fe;
                    font-size:13px;
                    font-weight:600;
                    margin-bottom:24px;
                }

                .dashboard-heading{
                    font-size:42px;
                    line-height:1.15;
                    font-weight:800;
                    color:#ffffff;
                    letter-spacing:-1px;
                    margin-bottom:16px;
                }

                .dashboard-description{
                    font-size:16px;
                    line-height:1.7;
                    color:#9ca3af;
                    max-width:500px;
                    margin-bottom:40px;
                }

                /* ================= CLEAN ANALYTICS CARD ================= */

                .analytics-card{
                    width:100%;
                    background:rgba(255,255,255,0.06);
                    backdrop-filter:blur(18px);
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:28px;
                    padding:30px;
                }

                .analytics-header{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:28px;
                }

                .analytics-title{
                    color:#fff;
                    font-size:20px;
                    font-weight:700;
                }

                .analytics-tag{
                    padding:8px 14px;
                    border-radius:999px;
                    background:rgba(91,61,245,0.22);
                    color:#d6ccff;
                    font-size:13px;
                    font-weight:600;
                }

                .stats-row{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:18px;
                    margin-bottom:26px;
                }

                .stat-box{
                    flex:1;
                }

                .stat-label{
                    font-size:13px;
                    color:#9ca3af;
                    margin-bottom:10px;
                }

                .stat-value{
                    font-size:32px;
                    font-weight:800;
                    color:#ffffff;
                    letter-spacing:-1px;
                }

                .progress-section{
                    margin-top:10px;
                }

                .progress-top{
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px;
                }

                .progress-label{
                    color:#e5e7eb;
                    font-size:14px;
                    font-weight:600;
                }

                .progress-value{
                    color:#ffffff;
                    font-size:14px;
                    font-weight:700;
                }

                .progress-bar{
                    width:100%;
                    height:10px;
                    background:rgba(255,255,255,0.08);
                    border-radius:999px;
                    overflow:hidden;
                }

                .progress-fill{
                    width:78%;
                    height:100%;
                    border-radius:999px;
                    background:linear-gradient(90deg,#7C66FF,#A78BFA);
                }

                /* ================= MOBILE ================= */

                @media(max-width:1100px){

                    .login-container{
                        flex-direction:column;
                    }

                    .login-left,
                    .login-right{
                        width:100%;
                    }

                    .login-left{
                        padding:50px 28px;
                    }

                    .login-right{
                        padding:40px 24px;
                        display: none;
                    }
                }

                @media(max-width:768px){

                    .welcome-title{
                        font-size:34px;
                    }

                    .dashboard-heading{
                        font-size:30px;
                    }

                    .stats-row{
                        flex-direction:column;
                        align-items:flex-start;
                    }

                    .analytics-card{
                        padding:22px;
                    }
                }
                `}
            </style>

            <div className="login-container">

                {/* LEFT PANEL */}
                <div className="login-left">

                    <div className="login-content">

                        <div className="brand">

                            <div className="brand-logo">
                                <img width={40} src="data:image/jpeg;base64,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" />
                            </div>

                            <div className="brand-text">
                                WebEngage Campaign Gallery
                            </div>

                        </div>

                        <h1 className="welcome-title">
                            Sign in to continue
                        </h1>

                        <p className="subtitle">
                            Access campaigns, templates, analytics, and engagement workflows from your centralized dashboard.
                        </p>

                        <div className="input-group">

                            <label>Username</label>

                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                        </div>

                        <div className="input-group">

                            <label>Password</label>

                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setUserPassword(e.target.value)}
                            />

                            <span
                                className="eye-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <VisibilityOffIcon/> :  <VisibilityIcon />}
                            </span>

                        </div>

                        <button
                            className="login-btn"
                            onClick={handleLogin}
                        >
                            Sign In
                        </button>

                        <button
                            className="guest-btn"
                            onClick={handleGuest}
                        >
                            Continue as Guest
                        </button>

                        {message && (
                            <p className="message">
                                {message}
                            </p>
                        )}

                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="login-right">

                    <div className="dashboard-wrapper">

                        <div className="dashboard-badge">
                            ● WebEngage Intelligence Suite
                        </div>

                        <h2 className="dashboard-heading">
                            Build meaningful customer engagement campaigns
                        </h2>

                        <p className="dashboard-description">
                            Manage campaigns, automate workflows, and monitor engagement performance from a unified platform.
                        </p>

                        <div className="analytics-card">

                            <div className="analytics-header">

                                <div className="analytics-title">
                                    Campaign Performance
                                </div>

                                <div className="analytics-tag">
                                    Live
                                </div>

                            </div>

                            <div className="stats-row">

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Active Campaigns
                                    </div>

                                    <div className="stat-value">
                                        128
                                    </div>

                                </div>

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Engagement Rate
                                    </div>

                                    <div className="stat-value">
                                        92%
                                    </div>

                                </div>

                                <div className="stat-box">

                                    <div className="stat-label">
                                        Notifications
                                    </div>

                                    <div className="stat-value">
                                        1.2M
                                    </div>

                                </div>

                            </div>

                            <div className="progress-section">

                                <div className="progress-top">

                                    <div className="progress-label">
                                        Campaign Delivery Performance
                                    </div>

                                    <div className="progress-value">
                                        78%
                                    </div>

                                </div>

                                <div className="progress-bar">
                                    <div className="progress-fill"></div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
};

export default Login;