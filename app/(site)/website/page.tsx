'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (typeof window !== 'undefined') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle scroll to detect when navigation should be fixed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const logoSearchHeight = document.getElementById('logo-search')?.offsetHeight || 0;
      setIsScrolled(window.scrollY > logoSearchHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <section id="logo-search" className="bg-gray-100 z-20 p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-blue-800 rounded-lg p-2">InnerBright</div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* User Icon */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Bar */}
      <nav
        className={`bg-white z-30 p-4 transition-all duration-300 ${
          isScrolled ? 'fixed top-0 left-0 right-0 shadow-lg' : 'relative'
        }`}
      >
        <div className="container mx-auto flex justify-center">
          <div className="bg-gray-100 flex space-x-6 rounded-lg">
            <NavItem onClick={() => scrollToSection('home')} isActive={activeSection === 'home'}>
              Trang chủ
            </NavItem>
            <NavItem onClick={() => scrollToSection('about')} isActive={activeSection === 'about'}>
              Về chúng tôi
            </NavItem>
            <NavItem onClick={() => scrollToSection('nlp')} isActive={activeSection === 'nlp'}>
              NLP
            </NavItem>
            <NavItem onClick={() => scrollToSection('tlt')} isActive={activeSection === 'tlt'}>
              Time Line Therapy
            </NavItem>
            <NavItem
              onClick={() => scrollToSection('experts')}
              isActive={activeSection === 'experts'}
            >
              Đội ngũ
            </NavItem>
            <NavItem
              onClick={() => scrollToSection('testimonials')}
              isActive={activeSection === 'testimonials'}
            >
              Học viên
            </NavItem>
            <NavItem
              onClick={() => scrollToSection('contact')}
              isActive={activeSection === 'contact'}
            >
              Liên hệ
            </NavItem>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      {isScrolled && <div className="h-20"></div>}

      {/* Hero Section */}
      <section
        id="home"
        className="rounded-lg relative h-screen flex items-center justify-center text-white text-center bg-gradient-to-r from-blue-700 to-indigo-900 overflow-hidden pt-16"
      >
        <div className="absolute inset-0 z-0 opacity-20">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            fill="currentColor"
          >
            <circle cx="20" cy="20" r="15" className="text-blue-400 animate-pulse"></circle>
            <circle
              cx="80"
              cy="40"
              r="10"
              className="text-indigo-300 animate-pulse animation-delay-200"
            ></circle>
            <circle
              cx="40"
              cy="70"
              r="12"
              className="text-blue-500 animate-pulse animation-delay-400"
            ></circle>
            <circle
              cx="60"
              cy="10"
              r="8"
              className="text-indigo-400 animate-pulse animation-delay-600"
            ></circle>
          </svg>
        </div>
        <div className="z-10 p-8 bg-black/30 rounded-xl shadow-2xl backdrop-filter backdrop-blur-sm border-4 border-white/30">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
            CÂU CHUYỆN VỀ InnerBright
          </h1>
          <p className="text-lg md:text-xl mb-4">
            InnerBright Training & Coaching được thành lập từ năm 2020
          </p>
          <p className="text-lg md:text-xl">bởi nhà đào tạo Chloe Quý Châu</p>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">Về InnerBright</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Image representing InnerBright team, similar to the provided image */}
              <img
                src="https://placehold.co/600x400/ADD8E6/000000?text=InnerBright+Team"
                alt="InnerBright Team"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400/ADD8E6/000000?text=Hình+ảnh+đội+ngũ+InnerBright';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
                Đội ngũ InnerBright
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Câu chuyện về InnerBright</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                InnerBright Training & Coaching được thành lập từ năm 2020 bởi nhà đào tạo Chloe Quỳ
                Châu, với sứ mệnh tạo dựng cuộc sống thịnh vượng cho người Việt Nam bằng việc khai
                phóng tiềm năng và giúp phát huy tối đa nội lực của mỗi cá nhân.
              </p>
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Sứ mệnh & Tầm nhìn</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Mang trong mình khát vọng tạo dựng cuộc sống thịnh vượng, InnerBright mong muốn mỗi
                người Việt Nam đều sở hữu quy trình phát triển bản thân, dùng đòn bẩy để tạo ra sự
                khác biệt và ảnh hưởng đến hệ sinh thái của riêng bạn.
              </p>
              <h3 className="text-2xl font-bold text-blue-700 mb-4">Giá trị cốt lõi:</h3>
              <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                <li>Phát triển bản thân là sức mạnh để thay đổi thế giới.</li>
                <li>Hệ thống đào tạo bài bản và chuyên nghiệp.</li>
                <li>Đồng hành cùng học viên trên hành trình chuyển hóa.</li>
              </ul>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">
              Hệ thống chứng nhận
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-blue-50 p-8 rounded-xl shadow-lg">
              <div>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  InnerBright Training & Coaching tự hào là thành viên chính thức và uy tín của Hiệp
                  hội NLP Hoa Kỳ (ABNLP) trong suốt 5 năm liên tiếp. ABNLP, với bề dày lịch sử, là
                  hiệp hội lâu đời nhất về Lập Trình Ngôn Ngữ Tư Duy (NLP - Neuro Linguistic
                  Programming) tại Hoa Kỳ, đã chứng nhận sự chuyên nghiệp và chất lượng đào tạo của
                  InnerBright.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Đặc biệt, InnerBright là đơn vị tiên phong tại Việt Nam được Ban Coaching Division
                  của Hiệp hội ABNLP chính thức bảo chứng là học viện đào tạo NLP Coaching. Sự công
                  nhận này khẳng định vị thế dẫn đầu của InnerBright trong việc mang đến chương
                  trình đào tạo NLP Coaching chuẩn quốc tế tại Việt Nam.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Placeholder images for certifications */}
                <img
                  src="https://placehold.co/150x100/AEC6CF/000000?text=ABNLP+Cert+1"
                  alt="ABNLP Certificate 1"
                  className="rounded-md shadow-md"
                />
                <img
                  src="https://placehold.co/150x100/AEC6CF/000000?text=ABNLP+Cert+2"
                  alt="ABNLP Certificate 2"
                  className="rounded-md shadow-md"
                />
                <img
                  src="https://placehold.co/150x100/AEC6CF/000000?text=Time+Line+Therapy+Cert"
                  alt="Time Line Therapy Certificate"
                  className="rounded-md shadow-md"
                />
                <img
                  src="https://placehold.co/150x100/AEC6CF/000000?text=Coaching+Cert"
                  alt="Coaching Certificate"
                  className="rounded-md shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NLP Section */}
      <section id="nlp" className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">
            NLP - Lập Trình Ngôn Ngữ Tư Duy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              title="Neuro - Tư duy"
              description="Thần kinh bên trong con người chúng ta liên tục hoạt động, thiết lập thông tin và tạo ra phản ứng."
              icon="🧠"
            />
            <InfoCard
              title="Linguistic - Ngôn ngữ"
              description="Ngôn ngữ không chỉ đơn thuần diễn đạt mà còn tác động mạnh mẽ đến tư duy và hành vi của chúng ta."
              icon="🗣️"
            />
            <InfoCard
              title="Programming - Lập trình"
              description="Giống như máy tính, chúng ta cũng được lập trình qua những thói quen và kinh nghiệm đã hấp thụ."
              icon="💻"
            />
          </div>
          <div className="mt-12 text-center">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              NLP là một tập hợp các công cụ và kỹ thuật hữu ích, trang bị cho bạn khả năng hiểu rõ
              bản thân, giao tiếp hiệu quả, thay đổi tư duy và hành vi, phát huy tiềm năng.
            </p>
            <button
              onClick={() => scrollToSection('tlt')}
              className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-full shadow-lg hover:bg-blue-800 transform hover:scale-105 transition-all duration-300"
            >
              Tìm hiểu thêm về Time Line Therapy
            </button>
          </div>
        </div>
      </section>

      {/* Time Line Therapy Section */}
      <section id="tlt" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">
            Time Line Therapy® (TLT)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Time Line Therapy (TLT) là một phương pháp trị liệu và phát triển cá nhân độc đáo,
                được sáng lập bởi Tiến sĩ Tad James vào năm 1980. TLT giúp bạn xác định và làm việc
                trực tiếp với gốc rễ của những cảm xúc tiêu cực, niềm tin giới hạn và các quyết định
                tiêu cực đã được hình thành trong quá khứ.
              </p>
              <h3 className="text-2xl font-semibold text-blue-700 mb-4">
                Giá trị nổi bật của TLT:
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                <li>Hiệu quả nhanh chóng và tác động sâu sắc.</li>
                <li>Giải quyết các vấn đề tâm lý như lo âu, trầm cảm, ám ảnh.</li>
                <li>Nâng cao lòng tự trọng và cải thiện các mối quan hệ.</li>
                <li>Giúp đạt được mục tiêu và tăng cường sức mạnh nội tại.</li>
              </ul>
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Image representing Time Line Therapy */}
              <img
                src="https://placehold.co/600x400/DDA0DD/000000?text=Time+Line+Therapy"
                alt="Time Line Therapy illustration"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x400/DDA0DD/000000?text=Minh+họa+Time+Line+Therapy';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <p className="absolute bottom-4 left-4 text-white text-lg font-semibold">
                Trị liệu Dòng thời gian
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experts Section */}
      <section id="experts" className="py-20 bg-blue-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">Đội ngũ chuyên gia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ExpertCard
              name="Chloe Quỳ Châu"
              title="Nhà đào tạo, Master Coach"
              description="Chloe Trần Thị Quỳ Châu là chuyên gia người Việt đầu tiên được ABNLP Coaching Division bảo chứng là nhà đào tạo NLP Master Coach. Cô tôn trọng và truyền tải nguyên bản công cụ NLP để học viên nắm vững và ứng dụng linh hoạt vào cuộc sống."
              image="https://placehold.co/300x300/FFD700/000000?text=Chloe+Quy+Chau" // Placeholder for Chloe's image
            />
            {/* Add more expert cards if needed, following the pattern in the image */}
            <ExpertCard
              name="Chuyên gia 2"
              title="Chuyên gia NLP"
              description="Mô tả về chuyên gia 2."
              image="https://placehold.co/300x300/C0C0C0/000000?text=Chuyen+gia+2"
            />
            <ExpertCard
              name="Chuyên gia 3"
              title="Chuyên gia Time Line Therapy"
              description="Mô tả về chuyên gia 3."
              image="https://placehold.co/300x300/D3D3D3/000000?text=Chuyen+gia+3"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-800 mb-12">
            Chia sẻ của học viên
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestimonialCard
              quote="InnerBright đã giúp tôi khám phá tiềm năng và thay đổi cuộc sống một cách tích cực."
              author="Tên học viên A"
              image="https://placehold.co/100x100/ADD8E6/000000?text=HV+A" // Placeholder for student image
            />
            <TestimonialCard
              quote="Các khóa học rất thực tế và hữu ích, tôi đã học được cách làm chủ cảm xúc của mình."
              author="Tên học viên B"
              image="https://placehold.co/100x100/DDA0DD/000000?text=HV+B" // Placeholder for student image
            />
            <TestimonialCard
              quote="Một hành trình tuyệt vời, tôi đã tìm thấy con đường phát triển bản thân rõ ràng hơn."
              author="Tên học viên C"
              image="https://placehold.co/100x100/ADD8E6/000000?text=HV+C" // Placeholder for student image
            />
            <TestimonialCard
              quote="Đội ngũ chuyên gia rất tận tâm và chuyên nghiệp, tôi rất hài lòng."
              author="Tên học viên D"
              image="https://placehold.co/100x100/DDA0DD/000000?text=HV+D" // Placeholder for student image
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-blue-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Liên hệ với chúng tôi</h2>
          <p className="text-lg mb-8">
            Bạn có thắc mắc hoặc muốn tìm hiểu thêm về các khóa học của InnerBright? Hãy liên hệ với
            chúng tôi ngay hôm nay!
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
            <ContactInfo icon="📞" text="090 837 0968" />
            <ContactInfo icon="📧" text="info@innerbright.vn" />
          </div>
          <p className="mt-12 text-md opacity-80">
            Hãy để InnerBright đồng hành cùng bạn trên hành trình khai phóng tiềm năng!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <div className="container mx-auto px-6">
          <p>&copy; {new Date().getFullYear()} InnerBright. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

// Reusable component for navigation items
const NavItem = ({
  children,
  onClick,
  isActive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    onClick={onClick}
    className={`font-medium py-2 px-4 rounded-full transition-colors duration-300 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

// Reusable component for info cards (used in NLP section)
const InfoCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) => (
  <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 border border-blue-200">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl font-semibold text-blue-700 mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Reusable component for contact information
const ContactInfo = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center space-x-3 bg-white/20 p-4 rounded-lg shadow-md">
    <div className="text-3xl">{icon}</div>
    <span className="text-xl font-medium">{text}</span>
  </div>
);

// Reusable component for Expert Cards
const ExpertCard = ({
  name,
  title,
  description,
  image,
}: {
  name: string;
  title: string;
  description: string;
  image: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center text-center border border-blue-200 transform hover:scale-105 transition-transform duration-300">
    <img
      src={image}
      alt={name}
      className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-400"
      onError={(e) => {
        (e.target as HTMLImageElement).onerror = null;
        (e.target as HTMLImageElement).src =
          'https://placehold.co/128x128/CCCCCC/000000?text=Expert';
      }}
    />
    <h3 className="text-xl font-bold text-blue-800 mb-2">{name}</h3>
    <p className="text-blue-600 font-semibold mb-4">{title}</p>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Reusable component for Testimonial Cards
const TestimonialCard = ({
  quote,
  author,
  image,
}: {
  quote: string;
  author: string;
  image: string;
}) => (
  <div className="bg-blue-50 p-6 rounded-xl shadow-lg text-center border border-blue-200 transform hover:scale-105 transition-transform duration-300">
    <p className="italic text-gray-700 mb-4">"{quote}"</p>
    <div className="flex items-center justify-center space-x-4">
      <img
        src={image}
        alt={author}
        className="w-16 h-16 rounded-full object-cover border-2 border-blue-300"
        onError={(e) => {
          (e.target as HTMLImageElement).onerror = null;
          (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/E0E0E0/000000?text=User';
        }}
      />
      <p className="font-semibold text-blue-800">- {author}</p>
    </div>
  </div>
);
