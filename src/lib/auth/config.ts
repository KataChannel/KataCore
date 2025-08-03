import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log('Checking authorization...');
      console.log('User:', auth?.user);
      console.log('Next URL:', nextUrl);
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnRoot = nextUrl.pathname === '/';

      // Cho phép truy cập trang chủ mà không cần đăng nhập
      if (isOnRoot) {
        return true;
      }

      // Xử lý trang login
      if (isOnLogin) {
        // Nếu chưa đăng nhập, cho phép truy cập login page
        if (!isLoggedIn) {
          return true;
        }
        // Nếu đã đăng nhập, redirect về admin (KHÔNG return Response.redirect ở đây)
        // Thay vào đó, return false để NextAuth tự động redirect
        return false;
      }

      // Yêu cầu đăng nhập cho trang admin
      if (isOnAdmin) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
    
    // Thêm callback để xử lý redirect sau khi đăng nhập
    async redirect({ url, baseUrl }) {
      // Nếu URL là trang login và user đã đăng nhập, redirect về admin
      if (url.startsWith('/login')) {
        return `${baseUrl}/admin`;
      }
      
      // Nếu URL là relative path, kết hợp với baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Nếu URL cùng origin, cho phép
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Mặc định redirect về admin
      return `${baseUrl}/admin`;
    }
  },
  providers: []
} satisfies NextAuthConfig;
