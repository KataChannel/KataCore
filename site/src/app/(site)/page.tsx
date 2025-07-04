import React from 'react';
import { Metadata } from 'next';
import Swipe from '@/app/components/common/swipe';
import FeaturedCategories from '../components/common/FeaturedCategories';
import Promo from '../components/common/Promo';
import PopularProducts from '../components/common/PopularProducts';
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
                    <h2 className="text-4xl font-bold mb-4">Chào mừng đến với cửa hàng</h2>
                    <p className="text-lg text-center max-w-md">
                        Khám phá bộ sưu tập sản phẩm chất lượng cao với giá tốt nhất
                    </p>
                </div>
            ),
            backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
            info: "Ưu đãi đặc biệt - Giảm giá lên đến 50%",
            shopUrl: "/products"
        },
        {
            id: 2,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-4xl font-bold mb-4">Thời trang mới nhất</h2>
                    <p className="text-lg text-center max-w-md">
                        Cập nhật xu hướng thời trang hot nhất năm 2025
                    </p>
                </div>
            ),
            backgroundImage: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=600&fit=crop",
            info: "Bộ sưu tập Xuân Hè 2025",
            shopUrl: "/fashion"
        },
        {
            id: 3,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-4xl font-bold mb-4">Công nghệ tiên tiến</h2>
                    <p className="text-lg text-center max-w-md">
                        Sản phẩm công nghệ mới nhất với tính năng vượt trội
                    </p>
                </div>
            ),
            backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
            info: "Miễn phí vận chuyển toàn quốc",
            shopUrl: "/tech"
        },
        {
            id: 4,
            content: (
                <div className="flex flex-col items-center justify-center h-full text-white">
                    <h2 className="text-4xl font-bold mb-4">Sức khỏe & Làm đẹp</h2>
                    <p className="text-lg text-center max-w-md">
                        Chăm sóc sức khỏe và làm đẹp với sản phẩm thiên nhiên
                    </p>
                </div>
            ),
            backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
            info: "Tư vấn miễn phí từ chuyên gia",
            shopUrl: "/beauty"
        }
    ];

    return (
        <div className="mx-auto">
            <div className="mb-8">
                <Swipe
                    slides={advancedSlides}
                    darkMode={false}
                    autoplay={true}
                    autoplayDelay={4000}
                    infinite={true}
                    showArrows={true}
                    showDots={true}
                    swipeThreshold={50}
                    transitionDuration={500}
                    containerStyle={{ 
                        padding: '0',
                        backgroundColor: 'transparent',
                        borderRadius: '12px',
                        margin: '0 auto',
                        maxWidth: '1200px'
                    }}
                />
            </div>
            {/* <FeaturedCategories />
            <Promo />
            <PopularProducts />
            <PopularProducts />
            <PopularProducts /> */}
        </div>
    );
}