import Header from './Header';

export default function IndexLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow w-full">
        {children}
      </div>
      {/* Le footer est déjà inclus dans la page index.js */}
    </div>
  );
}
