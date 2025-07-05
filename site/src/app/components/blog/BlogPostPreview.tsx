import React from 'react';

interface BlogPostPreviewProps {
    // Define your component props here
    message?: string;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ message = 'Hello from BlogPostPreview!' }) => {
    return (
        <div className="p-4 border rounded shadow">
            <p>{message}</p>
        </div>
    );
};

export default BlogPostPreview;