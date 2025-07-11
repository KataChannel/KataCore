import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';

export const metadata = {
  title: 'Taza Offical',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* <header className="sticky top-0 z-50">
      <Header />
      </header> */}
      <main>{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
