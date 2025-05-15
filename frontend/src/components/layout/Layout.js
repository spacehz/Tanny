import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow w-full">
        {children}
      </div>
      <Footer />
    </div>
  );
}
