import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({ shopName: 'Digital Khata', name: 'Shopkeeper' });
    const [customers, setCustomers] = useState([]);
    const [collectedAmount, setCollectedAmount] = useState(0);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('khata_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) setUser(parsedUser);
            }

            const storedCustomers = localStorage.getItem('khata_customers');
            if (storedCustomers) {
                const parsedCustomers = JSON.parse(storedCustomers);
                setCustomers(Array.isArray(parsedCustomers) ? parsedCustomers : []);
            }

            const storedCollected = localStorage.getItem('khata_collected_base');
            if (storedCollected) {
                setCollectedAmount(Number(storedCollected) || 0);
            }
        } catch (error) {
            console.error("Local storage parsing error, falling back to defaults.");
            setCustomers([]);
        }
    }, []);

    const saveCustomers = (updatedCustomers) => {
        setCustomers(updatedCustomers);
        localStorage.setItem('khata_customers', JSON.stringify(updatedCustomers));
    };

    const saveCollectedAmount = (amount) => {
        setCollectedAmount(amount);
        localStorage.setItem('khata_collected_base', amount.toString());
    };

    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // New modal state for resetting app data
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const calculatePending = (transactions) => {
        if (!transactions || !Array.isArray(transactions)) return 0;
        return transactions.reduce((sum, t) => {
            if (t.type === 'ITEM' && !t.paid) return sum + Number(t.amount);
            if (t.type === 'PAYMENT') return sum - Number(t.amount);
            return sum;
        }, 0);
    };

    const totalRemaining = useMemo(() => {
        if (!Array.isArray(customers)) return 0;
        return customers.reduce((sum, customer) => sum + calculatePending(customer.transactions), 0);
    }, [customers]);

    const totalCollectedDynamic = useMemo(() => {
        if (!Array.isArray(customers)) return collectedAmount;
        const paymentsFromActive = customers.reduce((sum, customer) => {
            if (!customer.transactions || !Array.isArray(customer.transactions)) return sum;
            return sum + customer.transactions.reduce((tSum, t) => {
                if (t.type === 'PAYMENT') return tSum + Number(t.amount);
                if (t.type === 'ITEM' && t.paid) return tSum + Number(t.amount);
                return tSum;
            }, 0);
        }, 0);
        return collectedAmount + paymentsFromActive;
    }, [customers, collectedAmount]);

    const filteredCustomers = useMemo(() => {
        if (!Array.isArray(customers)) return [];
        const lowerSearch = search.toLowerCase();
        return customers.filter(c => 
            (c.name && c.name.toLowerCase().includes(lowerSearch)) || 
            (c.phone && c.phone.includes(lowerSearch))
        );
    }, [customers, search]);

    const formatCurrency = (amount) => {
        return "Rs. " + (Number(amount) || 0).toLocaleString('en-PK');
    };

    const formatWhatsApp = (phone, customer) => {
        if (!phone) return '#';
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
        if (!cleaned.startsWith('92')) cleaned = '92' + cleaned;
        
        let url = `https://wa.me/${cleaned}`;
        
        if (customer) {
            const pending = calculatePending(customer.transactions);
            const unpaidItems = (customer.transactions || []).filter(t => t.type === 'ITEM' && !t.paid);
            
            if (pending > 0) {
                let msg = `Hello ${customer.name},\n\nThis is a friendly reminder from *${user?.shopName || 'Digital Khata'}*. Your current pending balance is *Rs. ${pending}*.\n\n*Unpaid Items:*\n`;
                unpaidItems.forEach(t => {
                    msg += `- ${t.desc} (Rs. ${t.amount})\n`;
                });
                msg += `\nPlease pay at your earliest convenience. Thank you!`;
                url += `?text=${encodeURIComponent(msg)}`;
            }
        }
        
        return url;
    };

    const resetAddForm = () => {
        setNewName('');
        setNewPhone('');
        setIsAddModalOpen(false);
    };

    const handleAddCustomer = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const newCustomer = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: newName.trim(),
            phone: newPhone.trim(),
            transactions: []
        };

        saveCustomers([newCustomer, ...(Array.isArray(customers) ? customers : [])]);
        resetAddForm();
    };

    const openCustomerProfile = (customer) => {
        setSelectedCustomer(customer);
        setNewItemDesc('');
        setNewItemPrice('');
        setPaymentAmount('');
    };

    const closeCustomerProfile = () => {
        setSelectedCustomer(null);
    };

    const handleAddTransaction = (e, type) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        let amount = 0;
        let desc = '';

        if (type === 'ITEM') {
            amount = Number(newItemPrice);
            desc = newItemDesc.trim();
            if (!desc || isNaN(amount) || amount <= 0) return;
        } else if (type === 'PAYMENT') {
            amount = Number(paymentAmount);
            desc = 'Payment Received';
            if (isNaN(amount) || amount <= 0) return;
        }

        const newTransaction = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            type,
            desc,
            amount,
            paid: false,
            date: new Date().toISOString()
        };

        const updatedCustomer = {
            ...selectedCustomer,
            transactions: [newTransaction, ...(Array.isArray(selectedCustomer.transactions) ? selectedCustomer.transactions : [])]
        };

        const updatedCustomers = customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c);
        saveCustomers(updatedCustomers);
        setSelectedCustomer(updatedCustomer);

        if (type === 'ITEM') {
            setNewItemDesc('');
            setNewItemPrice('');
        } else {
            setPaymentAmount('');
        }
    };

    const toggleTransactionPaid = (transactionId) => {
        if (!selectedCustomer) return;

        const updatedTransactions = (selectedCustomer.transactions || []).map(t => {
            if (t.id === transactionId) {
                return { ...t, paid: !t.paid };
            }
            return t;
        });

        const updatedCustomer = { ...selectedCustomer, transactions: updatedTransactions };
        const updatedCustomers = customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c);
        
        saveCustomers(updatedCustomers);
        setSelectedCustomer(updatedCustomer);
    };

    const promptDelete = (e, customer) => {
        e.stopPropagation();
        setCustomerToDelete(customer);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (customerToDelete) {
            const pending = calculatePending(customerToDelete.transactions);
            
            // Fix: Calculate everything the customer ALREADY paid before deleting
            const alreadyPaid = (customerToDelete.transactions || []).reduce((sum, t) => {
                if (t.type === 'PAYMENT') return sum + Number(t.amount);
                if (t.type === 'ITEM' && t.paid) return sum + Number(t.amount);
                return sum;
            }, 0);

            // The amount shifting permanently to collected is (Any remaining pending) + (What was already paid)
            const amountToSettle = (pending > 0 ? pending : 0) + alreadyPaid;
            
            if (amountToSettle > 0) {
                saveCollectedAmount(collectedAmount + amountToSettle);
            }
            
            saveCustomers(customers.filter(c => c.id !== customerToDelete.id));
        }
        setIsDeleteModalOpen(false);
        setCustomerToDelete(null);
        setSelectedCustomer(null);
    };

    const confirmResetData = () => {
        saveCustomers([]);
        saveCollectedAmount(0);
        setIsResetModalOpen(false);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] font-sans pb-20 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            <header className="bg-[#121212] text-white shadow-xl sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">{user?.shopName || 'Digital Khata'}</h1>
                            <p className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold mt-0.5">Shopkeeper: {user?.name || 'User'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsResetModalOpen(true)} className="text-gray-400 hover:text-red-400 transition p-2.5 rounded-full hover:bg-white/10 cursor-pointer" title="Reset All App Data">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-white transition p-2.5 rounded-full hover:bg-white/10 cursor-pointer" title="Logout">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-1.5 h-full bg-black"></div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gray-100 text-gray-800 p-2.5 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">To Collect</p>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">{formatCurrency(totalRemaining)}</h2>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-1.5 h-full bg-gray-400"></div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-gray-100 text-gray-600 p-2.5 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase">Collected</p>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-700 tracking-tight">{formatCurrency(totalCollectedDynamic)}</h2>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 mb-6 gap-4">
                    <h3 className="text-xl font-bold text-black tracking-tight">Customer Profiles</h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Customer
                    </button>
                </div>

                <div className="relative mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search customers..." 
                        className="w-full bg-white border border-gray-200 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all shadow-sm text-sm"
                    />
                </div>

                <div className="space-y-4">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 border-dashed">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">No customers found</h3>
                            <p className="text-gray-500 mt-1 text-sm">Click "Add New Customer" to start your digital khata.</p>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            const initials = (customer.name || 'U').split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase();
                            const pendingAmount = calculatePending(customer.transactions);
                            
                            return (
                                <div key={customer.id} onClick={() => openCustomerProfile(customer)} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-5 sm:items-center group hover:border-gray-300">
                                    <div className="flex-1 flex gap-5">
                                        <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 text-black flex items-center justify-center font-bold text-xl flex-shrink-0">
                                            {initials}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start sm:items-center">
                                                <h3 className="font-bold text-lg text-black group-hover:underline decoration-gray-300 underline-offset-4">{customer.name}</h3>
                                                <span className="sm:hidden bg-gray-100 text-black font-bold px-3 py-1.5 rounded-lg text-sm border border-gray-200">
                                                    {formatCurrency(pendingAmount)}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-2 inline-block">
                                                {customer.phone && customer.phone !== "N/A" ? (
                                                    <span className="text-xs text-gray-500 font-medium tracking-wide">{customer.phone}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No phone added</span>
                                                )}
                                            </div>
                                            
                                            <div className="mt-2 text-xs text-gray-400">
                                                {customer.transactions && customer.transactions.length > 0 
                                                    ? `${customer.transactions.length} transactions recorded` 
                                                    : 'No transactions yet'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="hidden sm:flex flex-col items-end min-w-[140px]">
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending Amount</p>
                                        <p className={`font-extrabold text-2xl tracking-tight ${pendingAmount <= 0 ? 'text-gray-500' : 'text-black'}`}>
                                            {formatCurrency(pendingAmount)}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end border-t border-gray-100 sm:border-0 sm:pl-6 pt-4 sm:pt-0 mt-4 sm:mt-0 w-full sm:w-auto">
                                        <button 
                                            onClick={(e) => promptDelete(e, customer)} 
                                            className="bg-white border border-gray-200 text-black hover:bg-black hover:text-white hover:border-black px-4 py-2 rounded-xl transition-colors flex justify-center items-center text-xs font-semibold shadow-sm cursor-pointer"
                                        >
                                            Settle / Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Add New Customer Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-black tracking-tight">Add New Customer</h3>
                            <button onClick={resetAddForm} className="text-gray-400 hover:text-black transition-colors p-1 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-8 bg-white">
                            <form onSubmit={handleAddCustomer} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">Customer Name *</label>
                                    <input 
                                        type="text" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 focus:bg-white transition-all text-sm font-medium text-black placeholder-gray-400" 
                                        placeholder="e.g. Sahil Khan"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ml-1">WhatsApp Number</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-gray-200 bg-gray-100 text-gray-500 text-sm font-semibold">
                                            +92
                                        </span>
                                        <input 
                                            type="text" 
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            className="flex-1 min-w-0 block w-full bg-gray-50 border border-gray-200 rounded-none rounded-r-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 focus:bg-white transition-all text-sm font-medium text-black placeholder-gray-400" 
                                            placeholder="300 1234567"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button onClick={resetAddForm} className="px-6 py-3 text-gray-600 font-semibold hover:bg-gray-200 rounded-full transition-colors text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleAddCustomer} className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-full shadow-lg transition-colors text-sm cursor-pointer">Create Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Profile & Transactions Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center sm:p-4">
                    <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        
                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={closeCustomerProfile} className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-black">{selectedCustomer.name}</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{selectedCustomer.phone ? `+92 ${selectedCustomer.phone}` : 'No phone added'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pending</p>
                                <p className={`text-2xl font-extrabold ${calculatePending(selectedCustomer.transactions) <= 0 ? 'text-gray-500' : 'text-black'}`}>
                                    {formatCurrency(calculatePending(selectedCustomer.transactions))}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-gray-50">
                            <div className="w-full md:w-2/3 p-6 border-r border-gray-200">
                                <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-6">Transaction History</h3>
                                <div className="space-y-4">
                                    {!selectedCustomer.transactions || selectedCustomer.transactions.length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                                            <p className="text-gray-500 text-sm">No transactions recorded yet.</p>
                                        </div>
                                    ) : (
                                        selectedCustomer.transactions.map((t) => (
                                            <div key={t.id} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center transition-all ${t.paid ? 'opacity-60 bg-gray-50' : ''}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'ITEM' ? 'bg-gray-100 text-black' : 'bg-black text-white'}`}>
                                                        {t.type === 'ITEM' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-gray-900 text-sm ${t.paid ? 'line-through text-gray-400' : ''}`}>{t.desc}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                                                    <div className={`font-bold ${t.type === 'ITEM' ? (t.paid ? 'text-gray-400 line-through' : 'text-black') : 'text-gray-500'}`}>
                                                        {t.type === 'ITEM' ? '+' : '-'} {formatCurrency(t.amount)}
                                                    </div>
                                                    {t.type === 'ITEM' && (
                                                        <button 
                                                            onClick={() => toggleTransactionPaid(t.id)}
                                                            className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors border cursor-pointer ${t.paid ? 'bg-white border-gray-200 text-gray-400 hover:text-black hover:border-black' : 'bg-black border-black text-white hover:bg-gray-800'}`}
                                                        >
                                                            {t.paid ? 'UNDO' : 'PAID'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 p-6 bg-white flex flex-col gap-8">
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-4">Add Items Given</h3>
                                    <form onSubmit={(e) => handleAddTransaction(e, 'ITEM')} className="space-y-4">
                                        <input 
                                            type="text" 
                                            value={newItemDesc}
                                            onChange={(e) => setNewItemDesc(e.target.value)}
                                            placeholder="Item details (e.g. 1 dozen eggs)" 
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm font-medium"
                                            required
                                        />
                                        <input 
                                            type="number" 
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                            placeholder="Amount (Rs.)" 
                                            min="1"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm font-medium"
                                            required
                                        />
                                        <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-md cursor-pointer">
                                            Add to Bill
                                        </button>
                                    </form>
                                </div>

                                <div className="border-t border-gray-100 pt-8">
                                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-widest mb-4">Receive Payment</h3>
                                    <form onSubmit={(e) => handleAddTransaction(e, 'PAYMENT')} className="space-y-4">
                                        <input 
                                            type="number" 
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder="Amount Received (Rs.)" 
                                            min="1"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm font-medium"
                                            required
                                        />
                                        <button type="submit" className="w-full bg-white border-2 border-black hover:bg-gray-50 text-black font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer">
                                            Record Payment
                                        </button>
                                    </form>
                                </div>
                                
                                {selectedCustomer.phone && selectedCustomer.phone !== 'N/A' && (
                                    <div className="mt-auto pt-6 text-center">
                                         <a href={formatWhatsApp(selectedCustomer.phone, selectedCustomer)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 text-sm bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 px-6 py-3 rounded-full font-bold transition-colors w-full border border-[#25D366]/20">
                                            Send Reminder on WhatsApp
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settle Customer Khata Modal */}
            {isDeleteModalOpen && customerToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-in fade-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-gray-100 text-black rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-2 tracking-tight">Settle Khata?</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Marking this as settled will add any remaining pending amount to your collected balance and remove <strong className="text-black">{customerToDelete.name}</strong> permanently.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmDelete} className="w-full py-3.5 bg-black text-white font-bold rounded-full hover:bg-gray-800 shadow-lg transition-colors text-sm cursor-pointer">Yes, Settle & Delete</button>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors text-sm cursor-pointer">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset All App Data Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 animate-in fade-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-2 tracking-tight">Clear All Data?</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            This will completely wipe your local testing data, removing all customers and resetting your collected balance back to zero. This action cannot be undone.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmResetData} className="w-full py-3.5 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 shadow-lg transition-colors text-sm cursor-pointer">Yes, Wipe Data</button>
                            <button onClick={() => setIsResetModalOpen(false)} className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors text-sm cursor-pointer">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;