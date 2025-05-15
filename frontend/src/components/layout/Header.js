import { useState } from 'react';
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

  const handleLogout = () => {
    logout();
    // Redirection vers la page d'accueil après déconnexion
    router.push('/');
  };

  return (
    <header className="bg-primary-600 text-white fixed top-0 left-0 right-0 z-20">
      {/* Modal d'inscription */}
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)} 
      />
      
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo - Ajusté pour tenir compte de la sidebar dans les pages admin */}
          <Link href="/" className={`text-xl font-bold ${router.pathname.startsWith('/admin') ? 'ml-64' : ''}`}>
            TANY
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6 ml-10">
            <Link href="/" className={`hover:text-primary-200 ${router.pathname === '/' ? 'font-bold' : ''}`}>
              Accueil
            </Link>
            <Link href="/about" className={`hover:text-primary-200 ${router.pathname === '/about' ? 'font-bold' : ''}`}>
              À propos
            </Link>
            <Link href="/contact" className={`hover:text-primary-200 ${router.pathname === '/contact' ? 'font-bold' : ''}`}>
              Contact
            </Link>
            
            {/* Liens conditionnels basés sur le rôle */}
            {isAdmin && (
              <Link href="/admin" className={`hover:text-primary-200 ${router.pathname.startsWith('/admin') ? 'font-bold' : ''}`}>
                Administration
              </Link>
            )}
            {isVolunteer && (
              <Link href="/volunteer" className={`hover:text-primary-200 ${router.pathname.startsWith('/volunteer') ? 'font-bold' : ''}`}>
                Espace Bénévole
              </Link>
            )}
            {isMerchant && (
              <Link href="/merchant" className={`hover:text-primary-200 ${router.pathname.startsWith('/merchant') ? 'font-bold' : ''}`}>
                Espace Commerçant
              </Link>
            )}
          </nav>

          {/* Spacer to push user info to the right */}
          <div className="flex-grow"></div>

          {/* Boutons de connexion/déconnexion - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center mr-4">
                  <div className="bg-primary-700 rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-white">Bonjour, {user?.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary-200 font-medium">
                  Connexion
                </Link>
                <button 
                  onClick={() => setShowRegisterModal(true)} 
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors font-medium"
                >
                  Inscription
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu - Mobile */}
          <button className="md:hidden" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={`hover:text-primary-200 ${router.pathname === '/' ? 'font-bold' : ''}`}>
                Accueil
              </Link>
              <Link href="/about" className={`hover:text-primary-200 ${router.pathname === '/about' ? 'font-bold' : ''}`}>
                À propos
              </Link>
              <Link href="/contact" className={`hover:text-primary-200 ${router.pathname === '/contact' ? 'font-bold' : ''}`}>
                Contact
              </Link>
              
              {/* Liens conditionnels basés sur le rôle */}
              {isAdmin && (
                <Link href="/admin" className={`hover:text-primary-200 ${router.pathname.startsWith('/admin') ? 'font-bold' : ''}`}>
                  Administration
                </Link>
              )}
              {isVolunteer && (
                <Link href="/volunteer" className={`hover:text-primary-200 ${router.pathname.startsWith('/volunteer') ? 'font-bold' : ''}`}>
                  Espace Bénévole
                </Link>
              )}
              {isMerchant && (
                <Link href="/merchant" className={`hover:text-primary-200 ${router.pathname.startsWith('/merchant') ? 'font-bold' : ''}`}>
                  Espace Commerçant
                </Link>
              )}

              {/* Boutons de connexion/déconnexion - Mobile */}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center mb-2">
                    <div className="bg-primary-700 rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium text-white">Bonjour, {user?.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors self-start font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-primary-200 font-medium">
                    Connexion
                  </Link>
                  <button 
                    onClick={() => setShowRegisterModal(true)} 
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors self-start font-medium"
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
