"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { Menu, X, ChevronDown, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/app/lib/config/site";
import SearchDialog, { 
  SearchDialogTrigger, 
  SearchDialogContent, 
  SearchResults,
  SearchResult 
} from "@/app/components/common/search";

export interface NavigationItem {
  name: string;
  href?: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string; visible?: boolean }[];
  visible?: boolean;
}

const defaultNavigationItems: NavigationItem[] = [
  { name: "Trang chủ", href: "/", visible: true },
  {
    name: "Dịch vụ",
    hasDropdown: true,
    visible: true,
    dropdownItems: [
      { name: "Phát triển Web", href: "/services/web-development", visible: true },
      { name: "Ứng dụng di động", href: "/services/mobile-app", visible: true },
      { name: "Thiết kế UI/UX", href: "/services/ui-ux", visible: true },
      { name: "Tư vấn IT", href: "/services/consulting", visible: true },
      { name: "Bảo trì & Hỗ trợ", href: "/services/support", visible: true },
    ],
  },
  { name: "Sản phẩm", href: "/products", visible: true },
  { name: "Dự án", href: "/projects", visible: true },
  { name: "Blog", href: "/blog", visible: true },
  { name: "Liên hệ", href: "/contact", visible: true },
];

interface HeaderProps {
  drawerPosition?: "left" | "right";
  menuItems?: NavigationItem[];
  showAuthButton?: boolean;
}

interface DropdownProps {
  item: NavigationItem;
  mobile?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ item, mobile = false }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  const containerClasses = mobile
    ? "pl-6 space-y-1"
    : "absolute top-full left-0 mt-1 w-56 bg-gray-50 dark:bg-gray-800 rounded-md shadow border border-gray-300 dark:border-gray-600 py-1";

  const buttonClasses = mobile
    ? "flex items-center justify-between w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
    : "flex items-center space-x-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg";

  const linkClasses = mobile
    ? "block px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
    : "block px-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg";

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${item.name}-dropdown`}
        className={buttonClasses}
      >
        <span>{item.name}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={`${item.name}-dropdown`} className={containerClasses}>
          {item.dropdownItems
            ?.filter((dropItem) => dropItem.visible !== false)
            .map((dropItem) => (
              <Link key={dropItem.name} href={dropItem.href} className={linkClasses}>
                {dropItem.name}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({
  drawerPosition = "left",
  menuItems = defaultNavigationItems,
  showAuthButton = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Sample search results data
  const searchResults: SearchResult[] = [
    {
      id: '1',
      title: 'Trang chủ',
      description: 'Trở về trang chính',
      category: 'Trang',
      url: '/',
      icon: <Search className="w-4 h-4" />
    },
    {
      id: '2',
      title: 'Dịch vụ',
      description: 'Xem các dịch vụ của chúng tôi',
      category: 'Trang',
      url: '/services',
      icon: <Search className="w-4 h-4" />
    },
    {
      id: '3',
      title: 'Liên hệ',
      description: 'Thông tin liên hệ',
      category: 'Trang',
      url: '/contact',
      icon: <Search className="w-4 h-4" />
    }
  ];

  const handleSearchSelect = (result: SearchResult) => {
    if (result.url) {
      router.push(result.url);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleAuthIcon = () => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      router.push("/register");
    }
  };

  // Filter menu items that should be visible
  const visibleMenuItems = menuItems.filter((item) => item.visible !== false);

  // Classes for mobile drawer position
  const drawerPositionClasses = drawerPosition === "left" ? "left-0" : "right-0";

  return (
    <>
      <header className="relative flex !lg:flex-col flex-row md:flex-row justify-between items-center p-4 border-gray-500 rounded shadow-md bg-white">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-transform active:scale-95"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <Image src={siteConfig.logo} alt="Logo" width={50} height={50} />
          </Link>
        </div>
        {/* Navigation for Desktop */}
        <nav className="hidden lg:block">
          <div className="flex items-center space-x-8">
            {visibleMenuItems.map((item) =>
              item.hasDropdown ? (
                <Dropdown key={item.name} item={item} />
              ) : (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </nav>
        {/* Action Icons: Search & Auth */}
        <div className="flex items-center space-x-4">
          <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SearchDialogTrigger asChild>
              <button
                className="p-2 rounded-md text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-transform active:scale-95"
                aria-label="Toggle search dialog"
              >
                <Search className="h-6 w-6" />
              </button>
            </SearchDialogTrigger>
            <SearchDialogContent placeholder="Tìm kiếm...">
              <SearchResults 
                results={searchResults}
                onSelect={handleSearchSelect}
                emptyMessage="Không tìm thấy kết quả"
              />
            </SearchDialogContent>
          </SearchDialog>
          {showAuthButton && (
            <button
              onClick={handleAuthIcon}
              className="p-2 rounded-md text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-transform active:scale-95"
              aria-label="User auth"
            >
              <User className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Responsive Drawer for Mobile Navigation */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black opacity-50 z-40"
              onClick={toggleMobileMenu}
            />
            {/* Drawer */}
            <aside
              className={`fixed top-0 ${drawerPositionClasses} w-3/4 max-w-sm h-full bg-white dark:bg-black shadow-lg z-50 transform transition-transform duration-300`}
            >
              <div className="p-4">
                <button
                  onClick={toggleMobileMenu}
                  className="mb-4 p-2 rounded-md text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-transform active:scale-95"
                  aria-label="Close mobile menu"
                >
                  <X className="h-6 w-6" />
                </button>
                {/* Mobile Navigation */}
                <nav>
                  {visibleMenuItems.map((item) =>
                    item.hasDropdown ? (
                      <Dropdown key={item.name} item={item} mobile />
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href || "#"}
                        onClick={toggleMobileMenu}
                        className="block px-3 py-2 bg-gray-50 dark:bg-gray-800 text-base font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 rounded-lg"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </nav>
              </div>
            </aside>
          </>
        )}
      </header>
    </>
  );
};

export default Header;
