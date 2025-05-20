import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import RegisterModal from '../RegisterModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin, isVolunteer, isMerchant } = useAuth();
  
  // Debug log to check if user and isAuthenticated are correctly set
  console.log('Header - User:', user);
  console.log('Header - isAuthenticated:', isAuthenticated);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Écouter l'événement personnalisé pour ouvrir le modal d'inscription
  useEffect(() => {
    const handleOpenRegisterModal = () => {
      setShowRegisterModal(true);
    };
    
    document.addEventListener('open-register-modal', handleOpenRegisterModal);
    
    return () => {
      document.removeEventListener('open-register-modal', handleOpenRegisterModal);
    };
  }, []);

  const handleLogout = () => {
    logout();
    // Redirection vers la page d'accueil après déconnexion
    router.push('/');
  };

  return (
    <header className="bg-primary-600 text-white fixed top-0 left-0 right-0 z-20 h-16 shadow-header">
      {/* Modal d'inscription */}
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />
      
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo avec effet de transition */}
          <Link href="/" className="text-2xl font-bold tracking-wide hover:text-primary-200 transition-colors duration-300 flex items-center">
            <span className="text-white">T</span>
            <span className="text-primary-300">ANY</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8 ml-10">
            <Link href="/about" className={`hover:text-white transition-colors duration-300 relative group ${router.pathname === '/about' ? 'font-bold' : ''}`}>
              À propos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className={`hover:text-white transition-colors duration-300 relative group ${router.pathname === '/contact' ? 'font-bold' : ''}`}>
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Spacer to push user info to the right */}
          <div className="flex-grow"></div>

          {/* Boutons de connexion/déconnexion - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center mr-4">
                  <div className="bg-primary-700 rounded-full p-1.5 mr-2 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">Bonjour, <span className="text-primary-200">{user?.name}</span></span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary-200 font-medium transition-colors duration-300 relative group">
                  Connexion
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <button 
                  onClick={() => setShowRegisterModal(true)} 
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                >
                  Inscription
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu - Mobile avec animation */}
          <button className="md:hidden focus:outline-none group" onClick={toggleMenu}>
            <div className="relative w-6 h-5">
              <span className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 top-2.5' : 'top-0'}`}></span>
              <span className={`absolute h-0.5 w-6 bg-white top-2 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute h-0.5 w-6 bg-white transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 top-2.5' : 'top-4'}`}></span>
            </div>
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fadeIn">
            <nav className="flex flex-col space-y-3">
              <Link href="/about" className={`hover:text-white transition-colors duration-300 ${router.pathname === '/about' ? 'font-bold' : ''}`}>
                À propos
              </Link>
              <Link href="/contact" className={`hover:text-white transition-colors duration-300 ${router.pathname === '/contact' ? 'font-bold' : ''}`}>
                Contact
              </Link>

              {/* Boutons de connexion/déconnexion - Mobile */}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary-700 rounded-full p-1.5 mr-2 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-white">Bonjour, <span className="text-primary-200">{user?.name}</span></span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-all duration-300 self-start font-medium shadow-sm hover:shadow-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-white transition-colors duration-300 font-medium">
                    Connexion
                  </Link>
                  <button 
                    onClick={() => setShowRegisterModal(true)} 
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-all duration-300 self-start font-medium shadow-sm hover:shadow-md"
                  >
                    Inscription
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
