import React from 'react';
import Image from 'next/image';

const Promo = () => {
    return (
        <div className="grid grid-cols-2 gap-6 p-4">
            <div className="flex flex-col md:flex-row bg-white shadow rounded overflow-hidden border">
                <Image
                    src="/path-to-fruits-vegetables-image.jpg"
                    alt="Fruits & Vegetables"
                    className="w-full md:w-1/2 object-cover"
                    width={500}
                    height={300}
                />
                <div className="p-4 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold mb-2">Fruits & Vegetables</h2>
                    <p className="text-lg mb-4">Get Up to 30% Off</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Shop Now
                    </button>
            <div className="flex flex-col md:flex-row bg-white shadow rounded overflow-hidden border">
                <Image
                    src="/path-to-freshly-baked-buns-image.jpg"
                    alt="Freshly Baked Buns"
                    className="w-full md:w-1/2 object-cover"
                    width={500}
                    height={300}
                />
                <div className="p-4 flex flex-col justify-center">
                    <h2 className="text-2xl font-semibold mb-2">Freshly Baked Buns</h2>
                    <p className="text-lg mb-4">Get Up to 25% Off</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Shop Now
                    </button>
                </div>
            </div>
                </div>
            </div>
        </div>
    );
};

export default Promo;