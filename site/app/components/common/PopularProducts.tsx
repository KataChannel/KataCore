import React from 'react';
import Image from 'next/image';

type Product = {
    id: number;
    title: string;
    imageUrl: string;
};

const popularProducts: Product[] = [
    { id: 1, title: "Product 1", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 2, title: "Product 2", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 3, title: "Product 3", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 4, title: "Product 4", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 5, title: "Product 5", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 6, title: "Product 6", imageUrl: "https://via.placeholder.com/300x200" },
];

const PopularProducts: React.FC = () => {
    return (
        <section className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Popular Products
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {popularProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center transition duration-300 hover:shadow-xl">
                        <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={300}
                            height={200}
                            className="w-full h-40 object-cover mb-4 rounded"
                        />
                        <h3 className="text-xl text-gray-700 dark:text-gray-200">
                            {product.title}
                        </h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PopularProducts;