import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Lock, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="bg-lawn-600 p-2 rounded-xl text-white">
                                <Leaf size={20} strokeWidth={2.5} />
                            </div>
                            <span className="font-extrabold text-xl text-slate-800 tracking-tight">JobMow</span>
                        </Link>
                        <p className="text-slate-500 max-w-xs leading-relaxed">
                            The intelligent operating system for lawn care professionals. Scale your business with AI-powered tools designed for landscaping growth.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-lawn-600 hover:bg-lawn-50 transition-all"><Twitter size={18} /></a>
                            <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"><Github size={18} /></a>
                            <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Product</h4>
                        <ul className="space-y-3">
                            <li><Link to="/features" className="text-slate-500 hover:text-lawn-600 transition-colors">Features</Link></li>
                            <li><Link to="/book" className="text-slate-500 hover:text-lawn-600 transition-colors">Booking Widget</Link></li>
                            <li><Link to="/toolkit" className="text-slate-500 hover:text-lawn-600 transition-colors">Free Toolkit</Link></li>
                            <li><Link to="/founders" className="text-slate-500 hover:text-lawn-600 transition-colors">Waitlist</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-slate-500 hover:text-lawn-600 transition-colors">About Us</Link></li>
                            <li><a href="#" className="text-slate-500 hover:text-lawn-600 transition-colors">Blog</a></li>
                            <li><Link to="/contact" className="text-slate-500 hover:text-lawn-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/login" className="text-slate-500 hover:text-lawn-600 transition-colors">Login</Link></li>
                            <li><Link to="/docs" className="text-slate-500 hover:text-lawn-600 transition-colors">Documentation</Link></li>
                            <li><Link to="/help" className="text-slate-500 hover:text-lawn-600 transition-colors">Help Center</Link></li>
                            <li><Link to="/status" className="text-slate-500 hover:text-lawn-600 transition-colors">API Status</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-slate-400 text-xs font-medium">
                            © {currentYear} JobMow Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/legal" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Privacy Policy</Link>
                            <Link to="/legal" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Terms of Service</Link>
                            <Link to="/legal" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Cookie Policy</Link>
                        </div>
                    </div>

                    {user ? (
                        <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-400 hover:text-lawn-600 hover:bg-lawn-50 transition-all border border-slate-100"
                        >
                            <Lock size={12} />
                            Pro Dashboard
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-slate-300" />
                            <span className="text-xs font-bold text-slate-400">hello@jobmow.pro</span>
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
