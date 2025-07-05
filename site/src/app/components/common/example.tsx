// "use client"
// import React, { useState, createContext, useContext, ReactNode, FC } from 'react';
// import { 
//     Menu, 
//     X, 
//     Search, 
//     ChevronDown, 
//     User, 
//     Settings, 
//     LogOut,
//     ShoppingCart,
//     Bell,
//     Facebook, 
//     Twitter, 
//     Instagram, 
//     Linkedin, 
//     Mail, 
//     Phone, 
//     MapPin 
// } from 'lucide-react';

// // Types
// interface NavigationItem {
//     name: string;
//     href: string;
//     hasDropdown?: boolean;
//     dropdownItems?: { name: string; href: string }[];
// }

// interface Logo {
//     icon?: ReactNode;
//     text?: string;
// }

// interface ProfileData {
//     name: string;
//     email: string;
//     initials: string;
//     menuItems?: { name: string; href: string; icon?: any }[];
// }

// interface HeaderProps {
//     navigationItems?: NavigationItem[];
//     logo?: Logo;
//     searchPlaceholder?: string;
//     profileData?: ProfileData;
//     showSearch?: boolean;
//     showNotifications?: boolean;
//     showCart?: boolean;
// }

// interface CompanyInfo {
//     name: string;
//     description: string;
//     contact: {
//         address: string;
//         phone: string;
//         email: string;
//     };
// }

// interface FooterLinks {
//     [key: string]: { name: string; href: string }[];
// }

// interface SocialLink {
//     name: string;
//     icon: any;
//     href: string;
// }

// interface CustomSection {
//     title: string;
//     content: ReactNode;
// }

// interface FooterProps {
//     companyInfo?: CompanyInfo;
//     footerLinks?: FooterLinks;
//     socialLinks?: SocialLink[];
//     showNewsletter?: boolean;
//     customSections?: CustomSection[];
// }

// interface LayoutConfig {
//     showHeader?: boolean;
//     showFooter?: boolean;
//     containerMaxWidth?: string;
//     backgroundColor?: string;
// }

// interface MainProps extends React.HTMLAttributes<HTMLDivElement> {
//     useContainer?: boolean;
// }

// interface LayoutProps {
//     children: ReactNode;
//     layoutConfig?: LayoutConfig;
//     headerProps?: HeaderProps;
//     footerProps?: FooterProps;
//     mainProps?: MainProps;
// }

// // Context for layout data
// interface LayoutContextValue {
//     layoutConfig?: LayoutConfig;
//     headerProps?: HeaderProps;
//     footerProps?: FooterProps;
// }
// const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

// // Header Component
// const Header: FC<HeaderProps> = ({
//     navigationItems,
//     logo,
//     searchPlaceholder,
//     profileData,
//     showSearch = true,
//     showNotifications = true,
//     showCart = true
// }) => {
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [isProfileOpen, setIsProfileOpen] = useState(false);
//     const [openDropdown, setOpenDropdown] = useState<string|null>(null);

//     const defaultNav: NavigationItem[] = [
//         { name: 'Trang chủ', href: '/' },
//         { name: 'Về chúng tôi', href: '/about' },
//         { name: 'Liên hệ', href: '/contact' }
//     ];

//     const nav = navigationItems || defaultNav;

//     return (
//         <header className="bg-white shadow-lg sticky top-0 z-50">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex justify-between items-center h-16">
//                     {/* Logo */}
//                     <div className="flex-shrink-0 flex items-center">
//                         <a href="/" className="flex items-center space-x-2">
//                             <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//                                 <span className="text-white font-bold text-lg">
//                                     {logo?.icon || 'TC'}
//                                 </span>
//                             </div>
//                             <span className="text-xl font-bold text-gray-900 hidden sm:block">
//                                 {logo?.text || 'TechCompany'}
//                             </span>
//                         </a>
//                     </div>

//                     {/* Desktop Navigation */}
//                     <div className="hidden lg:flex items-center space-x-8">
//                         {nav.map((item) => (
//                             <div key={item.name} className="relative">
//                                 {item.hasDropdown ? (
//                                     <div className="relative">
//                                         <button
//                                             onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
//                                             className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
//                                         >
//                                             <span>{item.name}</span>
//                                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
//                                         </button>
                                        
//                                         {openDropdown === item.name && (
//                                             <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                                                 {item.dropdownItems?.map((dropdownItem) => (
//                                                     <a
//                                                         key={dropdownItem.name}
//                                                         href={dropdownItem.href}
//                                                         className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
//                                                     >
//                                                         {dropdownItem.name}
//                                                     </a>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <a
//                                         href={item.href}
//                                         className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
//                                     >
//                                         {item.name}
//                                     </a>
//                                 )}
//                             </div>
//                         ))}
//                     </div>

//                     {/* Search Bar */}
//                     {showSearch && (
//                         <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
//                             <div className="relative w-full">
//                                 <input
//                                     type="text"
//                                     placeholder={searchPlaceholder || "Tìm kiếm..."}
//                                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                             </div>
//                         </div>
//                     )}

//                     {/* Right Side Items */}
//                     <div className="flex items-center space-x-4">
//                         {/* Notifications */}
//                         {showNotifications && (
//                             <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
//                                 <Bell className="h-5 w-5" />
//                                 <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
//                             </button>
//                         )}

//                         {/* Shopping Cart */}
//                         {showCart && (
//                             <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
//                                 <ShoppingCart className="h-5 w-5" />
//                                 <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
//                                     3
//                                 </span>
//                             </button>
//                         )}

//                         {/* Profile Dropdown */}
//                         {profileData && (
//                             <div className="relative">
//                                 <button
//                                     onClick={() => setIsProfileOpen(!isProfileOpen)}
//                                     className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
//                                 >
//                                     <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
//                                         <span className="text-white text-sm font-medium">
//                                             {profileData.initials || 'U'}
//                                         </span>
//                                     </div>
//                                     <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
//                                 </button>

//                                 {isProfileOpen && (
//                                     <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
//                                         <div className="px-4 py-2 border-b border-gray-200">
//                                             <p className="text-sm font-medium text-gray-900">{profileData.name}</p>
//                                             <p className="text-sm text-gray-500">{profileData.email}</p>
//                                         </div>
//                                         {profileData.menuItems?.map((item) => {
//                                             const IconComponent = item.icon || User;
//                                             return (
//                                                 <a
//                                                     key={item.name}
//                                                     href={item.href}
//                                                     className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
//                                                 >
//                                                     <IconComponent className="h-4 w-4" />
//                                                     <span>{item.name}</span>
//                                                 </a>
//                                             );
//                                         })}
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Mobile Menu Button */}
//                         <button
//                             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                             className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Mobile Menu */}
//             {isMobileMenuOpen && (
//                 <div className="lg:hidden border-t border-gray-200">
//                     <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
//                         {/* Mobile Search */}
//                         {showSearch && (
//                             <div className="px-3 py-2">
//                                 <div className="relative">
//                                     <input
//                                         type="text"
//                                         placeholder={searchPlaceholder || "Tìm kiếm..."}
//                                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     />
//                                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                                 </div>
//                             </div>
//                         )}

//                         {/* Mobile Navigation Items */}
//                         {nav.map((item) => (
//                             <div key={item.name}>
//                                 {item.hasDropdown ? (
//                                     <div>
//                                         <button
//                                             onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
//                                             className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
//                                         >
//                                             <span>{item.name}</span>
//                                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
//                                         </button>
//                                         {openDropdown === item.name && (
//                                             <div className="pl-6 space-y-1">
//                                                 {item.dropdownItems?.map((dropdownItem) => (
//                                                     <a
//                                                         key={dropdownItem.name}
//                                                         href={dropdownItem.href}
//                                                         className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50"
//                                                     >
//                                                         {dropdownItem.name}
//                                                     </a>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <a
//                                         href={item.href}
//                                         className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
//                                     >
//                                         {item.name}
//                                     </a>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </header>
//     );
// };

// // Footer Component
// const Footer: FC<FooterProps> = ({
//     companyInfo,
//     footerLinks,
//     socialLinks,
//     showNewsletter = true,
//     customSections
// }) => {
//     const defaultCompany: CompanyInfo = {
//         name: 'YourCompany',
//         description: 'Building amazing digital experiences with cutting-edge technology.',
//         contact: {
//             address: '123 Tech Street, Ho Chi Minh City, Vietnam',
//             phone: '+84 123 456 789',
//             email: 'hello@yourcompany.com'
//         }
//     };

//     const defaultFooterLinks: FooterLinks = {
//         company: [
//             { name: 'Về chúng tôi', href: '/about' },
//             { name: 'Đội ngũ', href: '/team' },
//             { name: 'Tuyển dụng', href: '/careers' },
//             { name: 'Liên hệ', href: '/contact' }
//         ],
//         services: [
//             { name: 'Phát triển Web', href: '/services/web' },
//             { name: 'Ứng dụng di động', href: '/services/mobile' },
//             { name: 'Tư vấn', href: '/services/consulting' },
//             { name: 'Hỗ trợ', href: '/support' }
//         ]
//     };

//     const defaultSocial: SocialLink[] = [
//         { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
//         { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
//         { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
//         { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' }
//     ];

//     const company = companyInfo || defaultCompany;
//     const links = footerLinks || defaultFooterLinks;
//     const social = socialLinks || defaultSocial;
//     const currentYear = new Date().getFullYear();

//     return (
//         <footer className="bg-gray-900 text-white">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
//                     {/* Company Info */}
//                     <div className="lg:col-span-2">
//                         <div className="mb-4">
//                             <h3 className="text-2xl font-bold text-white mb-2">{company.name}</h3>
//                             <p className="text-gray-400 mb-4">{company.description}</p>
//                         </div>
                        
//                         {/* Contact Info */}
//                         <div className="space-y-2 text-sm text-gray-400">
//                             <div className="flex items-center space-x-2">
//                                 <MapPin className="h-4 w-4 flex-shrink-0" />
//                                 <span>{company.contact.address}</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <Phone className="h-4 w-4 flex-shrink-0" />
//                                 <span>{company.contact.phone}</span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <Mail className="h-4 w-4 flex-shrink-0" />
//                                 <span>{company.contact.email}</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Dynamic Footer Links */}
//                     {Object.entries(links).map(([key, items]) => (
//                         <div key={key}>
//                             <h4 className="font-semibold text-white mb-4 capitalize">
//                                 {key === 'company' ? 'Công ty' : 
//                                  key === 'services' ? 'Dịch vụ' : 
//                                  key === 'resources' ? 'Tài nguyên' : 
//                                  key === 'legal' ? 'Pháp lý' : key}
//                             </h4>
//                             <ul className="space-y-2">
//                                 {items.map((link) => (
//                                     <li key={link.name}>
//                                         <a 
//                                             href={link.href}
//                                             className="text-gray-400 hover:text-white transition-colors duration-200"
//                                         >
//                                             {link.name}
//                                         </a>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))}

//                     {/* Custom Sections */}
//                     {customSections?.map((section, index) => (
//                         <div key={index}>
//                             <h4 className="font-semibold text-white mb-4">{section.title}</h4>
//                             <div className="text-gray-400 text-sm">
//                                 {section.content}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Newsletter */}
//                 {showNewsletter && (
//                     <div className="mt-12 pt-8 border-t border-gray-800">
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//                             <div>
//                                 <h4 className="font-semibold text-white mb-2">Nhận thông tin mới nhất</h4>
//                                 <p className="text-gray-400 text-sm">
//                                     Đăng ký nhận bản tin để cập nhật thông tin và insights mới nhất.
//                                 </p>
//                             </div>
//                             <div className="flex flex-col sm:flex-row gap-3">
//                                 <input
//                                     type="email"
//                                     placeholder="Nhập email của bạn"
//                                     className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 />
//                                 <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 whitespace-nowrap">
//                                     Đăng ký
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Bottom Footer */}
//             <div className="border-t border-gray-800">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                     <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
//                         <div className="text-gray-400 text-sm">
//                             © {currentYear} {company.name}. Tất cả quyền được bảo lưu.
//                         </div>
//                         <div className="flex space-x-4">
//                             {social.map((item) => {
//                                 const IconComponent = item.icon;
//                                 return (
//                                     <a
//                                         key={item.name}
//                                         href={item.href}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-gray-400 hover:text-white transition-colors duration-200"
//                                         aria-label={item.name}
//                                     >
//                                         <IconComponent className="h-5 w-5" />
//                                     </a>
//                                 );
//                             })}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// };

// // Main Layout Component
// const Layout: FC<LayoutProps> = ({ 
//     children,
//     layoutConfig = {},
//     headerProps = {},
//     footerProps = {},
//     mainProps = {}
// }) => {
//     const {
//         showHeader = true,
//         showFooter = true,
//         containerMaxWidth = 'max-w-7xl',
//         backgroundColor = 'bg-gray-50'
//     } = layoutConfig;

//     return (
//         <LayoutContext.Provider value={{ layoutConfig, headerProps, footerProps }}>
//             <div className={`min-h-screen flex flex-col ${backgroundColor}`}>
//                 {/* Header */}
//                 {showHeader && <Header {...headerProps} />}
                
//                 {/* Main Content */}
//                 <main className={`flex-1 ${mainProps.className || ''}`} {...mainProps}>
//                     {mainProps.useContainer !== false ? (
//                         <div className={`${containerMaxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
//                             {children}
//                         </div>
//                     ) : (
//                         children
//                     )}
//                 </main>
                
//                 {/* Footer */}
//                 {showFooter && <Footer {...footerProps} />}
//             </div>
//         </LayoutContext.Provider>
//     );
// };

// // Hook to use layout context
// const useLayout = (): LayoutContextValue => {
//     const context = useContext(LayoutContext);
//     if (!context) {
//         throw new Error('useLayout must be used within a Layout component');
//     }
//     return context;
// };

// // Example usage component
// const ExamplePage: FC = () => {
//     // Dữ liệu dynamic cho layout
//     const layoutConfig: LayoutConfig = {
//         showHeader: true,
//         showFooter: true,
//         containerMaxWidth: 'max-w-6xl',
//         backgroundColor: 'bg-white'
//     };

//     const headerProps: HeaderProps = {
//         logo: {
//             icon: 'VN',
//             text: 'Vietnam Tech'
//         },
//         searchPlaceholder: 'Tìm kiếm sản phẩm...',
//         showCart: true,
//         showNotifications: true,
//         navigationItems: [
//             { name: 'Trang chủ', href: '/' },
//             { 
//                 name: 'Sản phẩm', 
//                 href: '/products',
//                 hasDropdown: true,
//                 dropdownItems: [
//                     { name: 'Website', href: '/products/website' },
//                     { name: 'Mobile App', href: '/products/mobile' },
//                     { name: 'E-commerce', href: '/products/ecommerce' }
//                 ]
//             },
//             { name: 'Dịch vụ', href: '/services' },
//             { name: 'Blog', href: '/blog' },
//             { name: 'Liên hệ', href: '/contact' }
//         ],
//         profileData: {
//             name: 'Nguyễn Văn A',
//             email: 'nguyen@example.com',
//             initials: 'NA',
//             menuItems: [
//                 { name: 'Hồ sơ', href: '/profile', icon: User },
//                 { name: 'Cài đặt', href: '/settings', icon: Settings },
//                 { name: 'Đăng xuất', href: '/logout', icon: LogOut }
//             ]
//         }
//     };

//     const footerProps: FooterProps = {
//         companyInfo: {
//             name: 'Vietnam Tech',
//             description: 'Xây dựng những trải nghiệm số tuyệt vời với công nghệ tiên tiến.',
//             contact: {
//                 address: '123 Đường Công nghệ, Quận 1, TP.HCM',
//                 phone: '+84 123 456 789',
//                 email: 'hello@vietnamtech.com'
//             }
//         },
//         footerLinks: {
//             company: [
//                 { name: 'Về chúng tôi', href: '/about' },
//                 { name: 'Đội ngũ', href: '/team' },
//                 { name: 'Tuyển dụng', href: '/careers' }
//             ],
//             services: [
//                 { name: 'Phát triển Web', href: '/web' },
//                 { name: 'Ứng dụng di động', href: '/mobile' },
//                 { name: 'Tư vấn IT', href: '/consulting' }
//             ],
//             resources: [
//                 { name: 'Blog', href: '/blog' },
//                 { name: 'Tài liệu', href: '/docs' },
//                 { name: 'Hỗ trợ', href: '/support' }
//             ]
//         },
//         showNewsletter: true,
//         customSections: [
//             {
//                 title: 'Giờ làm việc',
//                 content: (
//                     <div className="space-y-1">
//                         <p>Thứ 2 - Thứ 6: 9:00 - 18:00</p>
//                         <p>Thứ 7: 9:00 - 12:00</p>
//                         <p>Chủ nhật: Nghỉ</p>
//                     </div>
//                 )
//             }
//         ]
//     };

//     return (
//         <Layout 
//             layoutConfig={layoutConfig}
//             headerProps={headerProps}
//             footerProps={footerProps}
//         >
//             {/* Nội dung trang */}
//             <div className="space-y-8">
//                 <div className="text-center">
//                     <h1 className="text-4xl font-bold text-gray-900 mb-4">
//                         Chào mừng đến với Vietnam Tech
//                     </h1>
//                     <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//                         Chúng tôi tạo ra những giải pháp công nghệ tiên tiến để giúp doanh nghiệp 
//                         của bạn phát triển trong thời đại số.
//                     </p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     <div className="bg-white p-6 rounded-lg shadow-md">
//                         <h3 className="text-xl font-semibold mb-3">Phát triển Web</h3>
//                         <p className="text-gray-600">
//                             Xây dựng website hiện đại, responsive và tối ưu hóa SEO.
//                         </p>
//                     </div>
//                     <div className="bg-white p-6 rounded-lg shadow-md">
//                         <h3 className="text-xl font-semibold mb-3">Ứng dụng di động</h3>
//                         <p className="text-gray-600">
//                             Phát triển app iOS và Android với trải nghiệm người dùng tuyệt vời.
//                         </p>
//                     </div>
//                     <div className="bg-white p-6 rounded-lg shadow-md">
//                         <h3 className="text-xl font-semibold mb-3">Tư vấn IT</h3>
//                         <p className="text-gray-600">
//                             Đưa ra giải pháp công nghệ phù hợp với nhu cầu kinh doanh.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default ExamplePage;