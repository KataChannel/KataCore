import React from 'react';
import { Metadata } from 'next';
import Swipe from '@/components/common/swipe';
export const metadata: Metadata = {
    title: 'Home Page - Your E-commerce',
    description: 'This is the Home page for Your E-commerce.',
};

export default function HomePage() {
    const advancedSlides = [
        {
            id: 1,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-5xl font-light mb-6 tracking-wide">Chào mừng đến với cửa hàng</h2>
                    <p className="text-lg text-center max-w-lg font-light opacity-90 leading-relaxed">
                        Khám phá bộ sưu tập sản phẩm chất lượng cao với phong cách tối giản
                    </p>
                </div>
            ),
            backgroundImage: "https://placehold.co/1200x600/f0f0f0/333333",
            info: "Ưu đãi đặc biệt - Giảm giá lên đến 50%",
            shopUrl: "/products"
        },
        {
            id: 2,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-5xl font-light mb-6 tracking-wide">Thời trang tối giản</h2>
                    <p className="text-lg text-center max-w-lg font-light opacity-90 leading-relaxed">
                        Phong cách monochrome thanh lịch cho năm 2025
                    </p>
                </div>
            ),
            backgroundImage: "https://placehold.co/1200x600/f0f0f0/333333",
            info: "Bộ sưu tập Monochrome 2025",
            shopUrl: "/fashion"
        },
        {
            id: 3,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-5xl font-light mb-6 tracking-wide">Công nghệ tinh tế</h2>
                    <p className="text-lg text-center max-w-lg font-light opacity-90 leading-relaxed">
                        Thiết kế tối giản với hiệu năng vượt trội
                    </p>
                </div>
            ),
            backgroundImage: "https://placehold.co/1200x600/f0f0f0/333333",
            info: "Miễn phí vận chuyển toàn quốc",
            shopUrl: "/tech"
        },
        {
            id: 4,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-5xl font-light mb-6 tracking-wide">Sức khỏe & Làm đẹp</h2>
                    <p className="text-lg text-center max-w-lg font-light opacity-90 leading-relaxed">
                        Chăm sóc bản thân với triết lý tối giản
                    </p>
                </div>
            ),
            backgroundImage: "https://placehold.co/1200x600/f0f0f0/333333",
            info: "Tư vấn miễn phí từ chuyên gia",
            shopUrl: "/beauty"
        }
    ];

    return (
        <div className="mx-auto bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="mb-12">
                <Swipe
                    slides={advancedSlides}
                    darkMode={false}
                    autoplay={true}
                    autoplayDelay={5000}
                    infinite={true}
                    showArrows={true}
                    showDots={true}
                    swipeThreshold={50}
                    transitionDuration={600}
                    containerStyle={{ 
                        padding: '0',
                        backgroundColor: 'transparent',
                        borderRadius: '0px',
                        margin: '0 auto',
                        maxWidth: '100%',
                        boxShadow: 'none'
                    }}
                />
            </div>
            
            <div className="space-y-16 px-4 sm:px-6 lg:px-8">
                {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
                    <FeaturedCategories />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
                    <Promo />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-16">
                    <PopularProducts />
                </div> */}
            </div>
        </div>
    );
}