'use client';

import React, { useState, useEffect } from 'react';
import { ClientOnly } from '@/components/ClientOnly';

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <div
      className={`font-mono min-h-screen transition-all duration-500 ease-in-out ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Hướng Dẫn Xóa Dữ Liệu Người Dùng</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">Mục đích</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Hướng dẫn này cung cấp các bước để người dùng hoặc quản trị viên xóa dữ liệu cá nhân
            khỏi hệ thống, đảm bảo tuân thủ quyền riêng tư và các quy định pháp luật liên quan.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
            Phạm vi áp dụng
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Hướng dẫn áp dụng cho tất cả người dùng đã đăng ký tài khoản trên nền tảng tazaoffical
            và quản trị viên hệ thống có quyền truy cập vào dữ liệu người dùng.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-blue-600 dark:text-blue-400">
            Các bước xóa dữ liệu người dùng
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              1. Yêu cầu xóa dữ liệu
            </h3>

            <div className="mb-4">
              <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                Người dùng cá nhân:
              </h4>
              <ol className="list-decimal list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
                <li>
                  Đăng nhập vào tài khoản của bạn trên tazaoffical qua trang web tazaoffical.online
                  hoặc ứng dụng di động.
                </li>
                <li>
                  Truy cập mục{' '}
                  <strong className="text-gray-900 dark:text-white">Cài đặt tài khoản</strong> hoặc{' '}
                  <strong className="text-gray-900 dark:text-white">Quyền riêng tư</strong> trong hồ
                  sơ người dùng.
                </li>
                <li>
                  Chọn tùy chọn{' '}
                  <strong className="text-gray-900 dark:text-white">Yêu cầu xóa dữ liệu</strong> và
                  làm theo hướng dẫn.
                </li>
                <li>Xác nhận danh tính bằng email hoặc mã OTP (nếu được yêu cầu).</li>
                <li>Gửi yêu cầu và chờ xác nhận trong vòng 30 ngày làm việc.</li>
              </ol>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                Quản trị viên (trong trường hợp xóa dữ liệu thay cho người dùng):
              </h4>
              <ol className="list-decimal list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
                <li>
                  Đăng nhập vào{' '}
                  <strong className="text-gray-900 dark:text-white">
                    Bảng điều khiển quản trị
                  </strong>{' '}
                  tazaoffical.online.
                </li>
                <li>
                  Truy cập mục{' '}
                  <strong className="text-gray-900 dark:text-white">Quản lý người dùng</strong> và
                  tìm kiếm người dùng bằng tên, email hoặc ID người dùng.
                </li>
                <li>
                  Chọn{' '}
                  <strong className="text-gray-900 dark:text-white">Xóa dữ liệu người dùng</strong>{' '}
                  và xác nhận hành động.
                </li>
              </ol>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              2. Dữ liệu sẽ được xóa
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Khi yêu cầu xóa được chấp thuận, các dữ liệu sau sẽ bị xóa vĩnh viễn:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
              <li>Thông tin cá nhân (tên, email, số điện thoại, địa chỉ, v.v.).</li>
              <li>Lịch sử hoạt động (lịch sử duyệt web, nhật ký giao dịch, tin nhắn, v.v.).</li>
              <li>Dữ liệu ứng dụng (cài đặt tùy chỉnh, tệp tin tải lên, v.v.).</li>
              <li>Các tệp được lưu trữ trên đám mây liên quan đến tài khoản (nếu có).</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mt-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Lưu ý:</strong> Một số dữ liệu có thể được giữ lại trong 30 ngày để tuân thủ
                các yêu cầu pháp lý (ví dụ: hóa đơn, hợp đồng theo quy định tại Việt Nam hoặc quốc
                tế). Sau thời gian này, dữ liệu sẽ được xóa hoàn toàn.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              3. Lưu ý quan trọng
            </h3>
            <ul className="list-disc list-inside space-y-3 pl-4 text-gray-700 dark:text-gray-300">
              <li>
                <strong className="text-gray-900 dark:text-white">Sao lưu dữ liệu:</strong> Trước
                khi yêu cầu xóa, hãy sao lưu mọi thông tin quan trọng (ví dụ: tài liệu, hình ảnh) vì
                quá trình xóa là{' '}
                <strong className="text-red-600 dark:text-red-400">không thể khôi phục</strong>.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Tác động đến dịch vụ:</strong> Sau
                khi xóa dữ liệu, bạn sẽ mất quyền truy cập vào các dịch vụ liên quan đến tài khoản
                (ví dụ: nội dung đã lưu, lịch sử mua hàng).
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Tài khoản liên kết:</strong> Nếu
                tài khoản của bạn được liên kết với các dịch vụ bên thứ ba (Google, Facebook, v.v.),
                bạn cần xóa liên kết riêng biệt trên các nền tảng đó.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Thời gian xử lý:</strong> Yêu cầu
                xóa dữ liệu sẽ được xử lý trong vòng 30 ngày làm việc. Bạn sẽ nhận được email xác
                nhận khi quá trình hoàn tất.
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              4. Quyền của người dùng
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Theo các quy định về bảo vệ dữ liệu (như GDPR hoặc Luật An ninh mạng Việt Nam), bạn có
              quyền:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
              <li>Yêu cầu truy cập vào dữ liệu cá nhân của mình.</li>
              <li>Yêu cầu chỉnh sửa hoặc xóa dữ liệu.</li>
              <li>Từ chối một số hình thức thu thập dữ liệu (ví dụ: cookie không bắt buộc).</li>
              <li>
                Liên hệ với chúng tôi để được hỗ trợ qua tazachanneloffical@gmail.com hoặc
                0906447889.
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              5. Liên hệ
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Nếu bạn có thắc mắc về việc xóa dữ liệu hoặc cần hỗ trợ thêm, vui lòng liên hệ:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-gray-700 dark:text-gray-300">
              <li>
                <strong className="text-gray-900 dark:text-white">Email:</strong>{' '}
                tazachanneloffical@gmail.com
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Điện thoại:</strong> 0906447889
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Trang hỗ trợ:</strong>{' '}
                https://tazaoffical.online/support
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600 dark:text-green-400">
              6. Tuân thủ pháp luật
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Chúng tôi cam kết xử lý dữ liệu người dùng theo đúng quy định pháp luật hiện hành, bao
              gồm nhưng không giới hạn ở Luật An ninh mạng Việt Nam và các quy định quốc tế như GDPR
              (nếu áp dụng).
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4">
            <p className="text-red-800 dark:text-red-200">
              <strong>Cảnh báo:</strong> Việc sử dụng dịch vụ sau khi yêu cầu xóa dữ liệu (ví dụ:
              đăng nhập lại) có thể tạo ra bản ghi mới trong hệ thống. Hãy đảm bảo bạn không đăng
              nhập lại nếu muốn dữ liệu được xóa hoàn toàn.
            </p>
          </div>
        </section>
      </div>
    </div>
    </ClientOnly>
  );
}
