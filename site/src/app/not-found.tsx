'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [isDark, setIsDark] = useState(false);
    const [language, setLanguage] = useState('vi');

    useEffect(() => {
        // Check system preference
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(darkModeQuery.matches);

        // Get browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.includes('vi')) {
            setLanguage('vi');
        } else if (browserLang.includes('en')) {
            setLanguage('en');
        } else {
            setLanguage('vi'); // Default to Vietnamese
        }

        // Listen for changes
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDark(e.matches);
        };

        darkModeQuery.addEventListener('change', handleChange);
        return () => darkModeQuery.removeEventListener('change', handleChange);
    }, []);

    const content = {
        vi: {
            title: 'Không Tìm Thấy Trang',
            description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đến vị trí khác.',
            buttonText: 'Quay Về Trang Chủ'
        },
        en: {
            title: 'Page Not Found',
            description: "The page you're looking for doesn't exist or has been moved to another location.",
            buttonText: 'Return Home'
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 transition-all duration-500 ${
            isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-900'
        }`}>
            <div className="text-center space-y-12 max-w-lg">
                {/* Language Toggle */}
                <div className="absolute top-6 right-6">
                    <button
                        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                        className={`px-3 py-1 text-xs border rounded transition-all duration-300 ${
                            isDark 
                                ? 'border-zinc-700 text-zinc-300 hover:border-white' 
                                : 'border-zinc-300 text-zinc-700 hover:border-zinc-900'
                        }`}
                    >
                        {language === 'vi' ? 'EN' : 'VI'}
                    </button>
                </div>

                {/* Error Code */}
                <div className="space-y-6">
                    <h1 className="text-9xl font-extralight tracking-[0.2em] opacity-80">
                        404
                    </h1>
                    <div className={`h-[1px] w-32 mx-auto ${
                        isDark ? 'bg-gradient-to-r from-transparent via-white to-transparent' 
                               : 'bg-gradient-to-r from-transparent via-zinc-900 to-transparent'
                    }`}></div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-extralight tracking-[0.1em] opacity-90">
                        {content[language].title}
                    </h2>
                    <p className={`text-sm font-light leading-relaxed tracking-wide max-w-xs mx-auto ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                        {content[language].description}
                    </p>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                    <Link 
                        href="/"
                        className={`group inline-flex items-center gap-3 px-8 py-4 border transition-all duration-300 font-light tracking-[0.1em] text-xs uppercase hover:scale-[1.02] ${
                            isDark 
                                ? 'border-zinc-700 text-zinc-300 hover:border-white hover:bg-white hover:text-zinc-900' 
                                : 'border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white'
                        }`}
                    >
                        <svg 
                            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {content[language].buttonText}
                    </Link>
                </div>

                {/* Decorative Element */}
                <div className="pt-8">
                    <div className={`flex items-center justify-center space-x-2 ${
                        isDark ? 'text-zinc-700' : 'text-zinc-400'
                    }`}>
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                        <div className="w-1 h-1 rounded-full bg-current opacity-40"></div>
                        <div className="w-1 h-1 rounded-full bg-current opacity-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}