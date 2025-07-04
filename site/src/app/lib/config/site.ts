export const siteConfig = {
    title: "Tên Website",
    offline: true, // Chỉ sử dụng khi website không cần kết nối internet
    maintenance: {
        enabled: false, // Bật/tắt chế độ bảo trì
        message: "Website đang trong quá trình bảo trì. Vui lòng quay lại sau!",
        allowedUsers: ["admin@example.com", "user@example.com"], // Email được phép truy cập khi bảo trì
        estimatedTime: "8/7/2025"
    },
    auth: {
        loginRequired: true, // Yêu cầu đăng nhập để truy cập
        redirectAfterLogin: "/dashboard", // Trang chuyển hướng sau khi đăng nhập thành công
        redirectAfterLogout: "/login"
    },
    theme: "light", // Chế độ giao diện: 'light', 'dark',
    logo: "/images/logo.png", // Đường dẫn đến logo của website
    logoDark: "/images/logo-dark.png", // Đường dẫn đến logo tối của website
    logoLight: "/images/logo-light.png", // Đường dẫn đến logo sáng của website
    logoWidth: 150, // Chiều rộng của logo
    logoHeight: 50, // Chiều cao của logo
    logoAlt: "Tên Website - Mô tả ngắn gọn về website",
    titleTemplate: "%s | Tên Website",
    titleSeparator: "|",
    titleSuffix: "Tên Website",
    description: "Mô tả ngắn gọn về website để tối ưu SEO.",
    keywords: [
        "từ khóa 1",
        "từ khóa 2",
        "từ khóa 3"
    ],
    url: "https://www.tenwebsite.com",
    author: {
        name: "Tên tác giả hoặc công ty",
        url: "https://www.tenwebsite.com/about"
    },
    language: "vi",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1.0",
    og: {
        type: "website",
        title: "Tên Website",
        description: "Mô tả ngắn gọn về website để tối ưu SEO.",
        url: "https://www.tenwebsite.com",
        image: "https://www.tenwebsite.com/og-image.jpg"
    },
    twitter: {
        card: "summary_large_image",
        site: "@twitter_handle",
        title: "Tên Website",
        description: "Mô tả ngắn gọn về website để tối ưu SEO.",
        image: "https://www.tenwebsite.com/twitter-image.jpg"
    },
    favicon: "/favicon.ico"
};