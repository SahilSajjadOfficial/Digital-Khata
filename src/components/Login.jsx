import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [shopName, setShopName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [authError, setAuthError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        let isValid = true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (password.length < 8) {
            setPasswordError('Min 8 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setAuthError('');
        
        if (validateForm()) {
            const storedUserStr = localStorage.getItem('khata_user');
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                if (storedUser.email === email && storedUser.password === password) {
                    if (shopName.trim() && shopName !== storedUser.shopName) {
                        const updatedUser = { ...storedUser, shopName: shopName.trim() };
                        localStorage.setItem('khata_user', JSON.stringify(updatedUser));
                    }
                    navigate('/dashboard');
                } else {
                    setAuthError('Invalid credentials. Please try again.');
                }
            } else {
                setAuthError('No account found. Please sign up first.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#eef0f2] p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="bg-[#f8f9fa] w-full max-w-[1100px] rounded-[2rem] shadow-xl flex flex-col lg:flex-row h-auto lg:h-[700px] overflow-hidden p-3 relative">
                
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between h-full relative z-20">
                    <div className="border border-gray-200 text-gray-800 px-4 py-1.5 rounded-full w-max text-xs font-bold tracking-wide bg-white mb-6">
                        Digital Khata
                    </div>

                    <div className="max-w-md w-full mx-auto lg:mx-0 mt-4">
                        <h2 className="text-3xl lg:text-4xl font-semibold text-black mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 text-sm mb-6">Sign in to review your latest transactions.</p>

                        {authError && (
                            <div className="bg-gray-100 border-l-4 border-gray-800 text-gray-700 p-3 mb-6 text-sm">
                                {authError}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 ml-5 mb-1.5">Shop Name</label>
                                <input
                                    type="text"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    className="w-full px-6 py-4 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 text-black placeholder-gray-400 text-sm"
                                    placeholder="Enter your shop name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-gray-500 ml-5 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full px-6 py-4 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 ${emailError ? 'border-red-500 ring-2 ring-red-500' : 'focus:ring-gray-300'} text-black placeholder-gray-400 text-sm`}
                                    placeholder="amelielaurent7622@gmail.com"
                                    required
                                />
                                {emailError && <p className="text-red-500 text-xs ml-5 mt-1">{emailError}</p>}
                            </div>

                            <div>
                                <div className="flex justify-between items-center ml-5 mr-5 mb-1.5">
                                    <label className="block text-[11px] font-medium text-gray-500">Password</label>
                                    <button type="button" className="text-[11px] text-gray-500 hover:text-black">Forgot password?</button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full px-6 py-4 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 ${passwordError ? 'border-red-500 ring-2 ring-red-500' : 'focus:ring-gray-300'} text-black placeholder-gray-400 text-sm`}
                                        placeholder="••••••••••••••••"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        )}
                                    </button>
                                </div>
                                {passwordError && <p className="text-red-500 text-xs ml-5 mt-1">{passwordError}</p>}
                            </div>

                            <button type="submit" className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-full transition-colors shadow-md text-sm">
                                Sign In
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-gray-500 w-full max-w-md relative z-30 mt-6">
                        <p>Don't have an account? <Link to="/signup" className="text-black font-bold hover:underline cursor-pointer">Sign up</Link></p>
                        <a href="#" className="hover:underline">Terms & Conditions</a>
                    </div>
                </div>

                <div className="hidden lg:block lg:w-1/2 bg-[#1a1a1a] rounded-[1.5rem] relative overflow-hidden h-full">
                    <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop" alt="Accounting" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                    
                    <button onClick={() => navigate('/')} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-2 text-white transition-colors z-20 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="absolute top-12 left-8 bg-[#2a2a2a]/90 backdrop-blur-md border border-white/5 rounded-2xl p-4 shadow-2xl w-60 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                            <span className="text-[11px] text-gray-200 font-semibold">Khata Updated</span>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-0.5 mb-4">Today, 09:30 AM</p>
                        <div className="flex -space-x-2">
                             <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] text-white">UK</div>
                             <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] text-white">AS</div>
                        </div>
                    </div>

                    <div className="absolute bottom-16 right-8 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-80 z-10">
                        <div className="flex justify-between items-end mb-5 border-b border-white/10 pb-5">
                            <div>
                                <p className="text-xs text-gray-300 mb-1 font-medium">Total Balance</p>
                                <p className="text-3xl text-white font-bold tracking-tight">Rs. 150K</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-white/60 text-xs">
                            <div className="flex flex-col items-center"><span className="font-semibold text-white mb-1">22</span><span className="text-[10px]">Sun</span></div>
                            <div className="flex flex-col items-center"><span className="font-semibold text-white mb-1">23</span><span className="text-[10px]">Mon</span></div>
                            <div className="flex flex-col items-center bg-white/20 rounded-lg px-2.5 py-1.5 -mt-1.5"><span className="font-semibold text-white mb-1">24</span><span className="text-[10px] text-white">Tue</span></div>
                            <div className="flex flex-col items-center"><span className="font-semibold text-white mb-1">25</span><span className="text-[10px]">Wed</span></div>
                            <div className="flex flex-col items-center"><span className="font-semibold text-white mb-1">26</span><span className="text-[10px]">Thu</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;