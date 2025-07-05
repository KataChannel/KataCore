import Footer from "@/app/components/common/Footer";
import Header from "@/app/components/common/Header";
export const metadata = {
  title: "Kata Offical",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="root-layout space-y-4">
      <header className="sticky top-0 z-50">
        <Header />
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  );
}
