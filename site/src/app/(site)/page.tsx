"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  MegaphoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentChartBarIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import ThemeManager from "@/components/ThemeManager";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on component mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(savedTheme ? savedTheme === "dark" : prefersDark);
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Define the software modules with their titles, descriptions, and icons
  const modules = [
    {
      title: "Quản lý Bán hàng",
      subtitle: "Sales Management",
      description:
        "Quản lý quy trình bán hàng, theo dõi đơn hàng và doanh thu. Cốt lõi để tạo dòng tiền cho doanh nghiệp.",
      icon: ChartBarIcon,
    },
    {
      title: "Quản lý Khách hàng",
      subtitle: "CRM",
      description:
        "Tổ chức thông tin khách hàng, tăng cường quan hệ và cải thiện tỷ lệ chuyển đổi đơn hàng.",
      icon: UsersIcon,
    },
    {
      title: "Quản lý Kho",
      subtitle: "Inventory Management",
      description:
        "Theo dõi tồn kho, nhập/xuất hàng. Thiết yếu cho bán lẻ, phân phối hoặc sản xuất.",
      icon: CubeIcon,
    },
    {
      title: "Quản lý Tài chính",
      subtitle: "Accounting & Finance",
      description:
        "Quản lý dòng tiền, hóa đơn điện tử, báo cáo thuế, đảm bảo tuân thủ pháp luật.",
      icon: CurrencyDollarIcon,
    },
    {
      title: "Quản lý Nhân sự",
      subtitle: "HRM",
      description:
        "Quản lý thông tin nhân viên, lương thưởng, chấm công. Quan trọng cho SMEs có đội ngũ lớn.",
      icon: UserGroupIcon,
    },
    {
      title: "Quản lý Dự án",
      subtitle: "Project Management",
      description:
        "Theo dõi tiến độ dự án, phân công nhiệm vụ, hỗ trợ quản lý nội bộ.",
      icon: ClipboardDocumentListIcon,
    },
    {
      title: "Quản lý Sản xuất",
      subtitle: "Manufacturing",
      description:
        "Quản lý quy trình sản xuất, tối ưu hóa nguồn lực. Chỉ cần cho SMEs trong ngành sản xuất.",
      icon: CogIcon,
    },
    {
      title: "Marketing",
      subtitle: "Digital Marketing",
      description:
        "Hỗ trợ xây dựng chiến dịch tiếp thị, quản lý kênh truyền thông. Thường tận dụng kênh miễn phí cho SMEs nhỏ.",
      icon: MegaphoneIcon,
    },
    {
      title: "Chăm sóc Khách hàng",
      subtitle: "Customer Support",
      description: "Quản lý yêu cầu hỗ trợ, cải thiện trải nghiệm khách hàng.",
      icon: ChatBubbleLeftRightIcon,
    },
    {
      title: "Báo cáo & Phân tích",
      subtitle: "Analytics",
      description:
        "Cung cấp dữ liệu để ra quyết định, phân tích hiệu suất kinh doanh.",
      icon: DocumentChartBarIcon,
    },
    {
      title: "Thương mại Điện tử",
      subtitle: "E-commerce",
      description:
        "Quản lý nền tảng bán hàng online, tối ưu website. Phù hợp cho SMEs có kênh bán hàng trực tuyến.",
      icon: ComputerDesktopIcon,
    },
  ];

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
      <div
        className={`font-mono min-h-screen transition-all duration-500 ease-in-out ${
          isDarkMode ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isDarkMode
              ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              : "bg-black/10 text-black hover:bg-black/20 border border-black/20"
          }`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>

        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-16">
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-4 sm:mb-8 tracking-tighter leading-none">
                GIẢI PHÁP
                <br />
                <span
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  PHẦN MỀM
                </span>
              </h1>
              <div
                className={`w-12 sm:w-20 h-px mx-auto mb-6 sm:mb-8 ${
                  isDarkMode ? "bg-white" : "bg-black"
                }`}
              ></div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-light mb-6 sm:mb-12 tracking-wide uppercase">
                Doanh nghiệp SME hiện đại
              </h2>
            </div>

            <div className="max-w-3xl mx-auto text-center">
              <p
                className={`text-base sm:text-lg mb-8 sm:mb-16 leading-relaxed ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Các module quản lý doanh nghiệp chuyên biệt, giúp SMEs tối ưu
                hóa hoạt động, tăng trưởng bền vững và đạt hiệu quả cao nhất.
              </p>
              <Link
                href="#modules"
                className={`inline-block border px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium uppercase tracking-wider transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                Khám phá Module
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="modules" className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-20">
              <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter">
                MODULE
              </h3>
              <div
                className={`w-12 sm:w-16 h-px mx-auto ${
                  isDarkMode ? "bg-white" : "bg-black"
                }`}
              ></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {modules.map((module, index) => {
                const IconComponent = module.icon;
                return (
                  <div
                    key={index}
                    className={`group border p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                      isDarkMode
                        ? "border-gray-800 hover:border-white hover:bg-white/5"
                        : "border-gray-200 hover:border-black hover:bg-black/5"
                    }`}
                  >
                    <div className="mb-6">
                      <IconComponent
                        className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${
                          isDarkMode
                            ? "text-white group-hover:text-gray-300"
                            : "text-black group-hover:text-gray-700"
                        }`}
                      />
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold mb-2 leading-tight">
                      {module.title}
                    </h4>
                    <p
                      className={`text-xs sm:text-sm font-medium mb-4 uppercase tracking-wider ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {module.subtitle}
                    </p>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {module.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6 sm:mb-8 tracking-tighter">
              PHÁT TRIỂN
              <br />
              <span
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                DOANH NGHIỆP
              </span>
            </h3>
            <div
              className={`w-12 sm:w-20 h-px mx-auto mb-8 sm:mb-12 ${
                isDarkMode ? "bg-white" : "bg-black"
              }`}
            ></div>
            <p
              className={`text-base sm:text-lg mb-8 sm:mb-16 max-w-2xl mx-auto leading-relaxed ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Liên hệ với chúng tôi ngay hôm nay để được tư vấn miễn phí và tìm
              hiểu cách các giải pháp phần mềm có thể giúp doanh nghiệp của bạn.
            </p>
            <a
              href="mailto:info@yourcompany.com"
              className={`inline-block border px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium uppercase tracking-wider transition-all duration-300 hover:scale-105 ${
                isDarkMode
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              Liên hệ ngay
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`border-t py-8 sm:py-12 px-4 sm:px-6 ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="max-w-7xl mx-auto text-center">
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              © 2024 KataCore. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
  );
}
