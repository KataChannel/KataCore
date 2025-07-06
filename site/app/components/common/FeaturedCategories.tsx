import React from 'react';

interface Category {
    id: number;
    name: string;
}

const sampleCategories: Category[] = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Art' },
    { id: 3, name: 'Music' },
    { id: 4, name: 'Travel' },
    { id: 5, name: 'Photography' },
    { id: 6, name: 'Lifestyle' },
];

const FeaturedCategories: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Featured Categories
            </h2>
            <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {sampleCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex items-center justify-center h-24 bg-gray-200 dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition"
                    >
                        <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                            {category.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedCategories;