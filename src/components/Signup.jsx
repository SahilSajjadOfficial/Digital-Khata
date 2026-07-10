import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [shopName, setShopName] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
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

    const handleSignup = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const userData = { shopName, name, email, phone, password };
            localStorage.setItem('khata_user', JSON.stringify(userData));
            if (!localStorage.getItem('khata_customers')) {
                localStorage.setItem('khata_customers', JSON.stringify([]));
            }
            if (!localStorage.getItem('khata_collected_base')) {
                localStorage.setItem('khata_collected_base', '0');
            }
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 sm:p-8">
            <div className="bg-white w-full max-w-[1100px] rounded-[2.5rem] shadow-xl flex flex-col md:flex-row min-h-[750px] p-2 relative">
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between relative z-10">
                    <div>
                        <div className="border border-gray-200 text-gray-800 px-5 py-2 rounded-full w-max text-xs font-semibold tracking-wide mb-8">
                            Digital Khata
                        </div>

                        <div className="w-full max-w-sm">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
                            <p className="text-gray-500 text-sm mb-8">Set up your digital ledger today.</p>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 ml-4 mb-1.5">Shop Name</label>
                                    <input
                                        type="text"
                                        value={shopName}
                                        onChange={(e) => setShopName(e.target.value)}
                                        className="w-full px-6 py-3.5 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400 text-sm transition-colors"
                                        placeholder="Al-Madina General Store"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 ml-4 mb-1.5">Shopkeeper Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-6 py-3.5 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400 text-sm transition-colors"
                                        placeholder="Ali Khan"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-xs font-medium text-gray-500 ml-4 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full px-6 py-3.5 rounded-full bg-white border ${emailError ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400 text-sm transition-colors`}
                                            placeholder="ali@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-xs font-medium text-gray-500 ml-4 mb-1.5">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-6 py-3.5 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400 text-sm transition-colors"
                                            placeholder="0300 1234567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 ml-4 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={`w-full pl-6 pr-12 py-3.5 rounded-full bg-white border ${passwordError ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-gray-400 text-gray-900 placeholder-gray-400 text-sm transition-colors tracking-wider`}
                                            placeholder="••••••••••••••••"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordError && <p className="text-red-500 text-xs ml-4 mt-1">{passwordError}</p>}
                                </div>

                                <button type="submit" className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-medium py-3.5 rounded-full transition-colors text-sm">
                                    Sign Up
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-gray-400 w-full mt-6 relative z-20">
                        <p>Have an account? <Link to="/" className="text-black font-bold hover:underline">Sign in</Link></p>
                        <a href="#" className="hover:underline text-gray-400">Terms & Conditions</a>
                    </div>
                </div>

                <div className="hidden md:block md:w-1/2 bg-[#1e1e1e] rounded-[2rem] relative overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop" 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale mix-blend-luminosity" 
                    />
                    
                    <button className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-2.5 text-white transition-colors z-20 focus:outline-none">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="absolute top-12 left-8 bg-[#2a2a2a] border border-white/5 rounded-2xl p-4 shadow-2xl w-60 z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-xs text-gray-200 font-medium">Khata Updated</span>
                        </div>
                        <p className="text-gray-400 text-[10px] mt-0.5 mb-3">Today, 09:30 AM</p>
                        <div className="flex -space-x-2">
                             <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] text-white">UK</div>
                             <div className="w-7 h-7 rounded-full bg-gray-400 border-2 border-[#2a2a2a] flex items-center justify-center text-[10px] text-white">AS</div>
                        </div>
                    </div>

                    <div className="absolute bottom-16 right-8 bg-[#333333]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-[300px] z-10">
                        <div className="flex justify-between items-end mb-5 border-b border-white/10 pb-5">
                            <div>
                                <p className="text-xs text-gray-300 mb-1">Total Balance</p>
                                <p className="text-3xl text-white font-bold tracking-tight">Rs. 0</p>
                            </div>
                        </div>
                        <div className="flex justify-between text-gray-400 text-xs">
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

export default Signup;