import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout, isAuthenticated, isAdmin, isVolunteer, isMerchant } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-primary-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            TANY
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-6">
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

          {/* Boutons de connexion/déconnexion - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Bonjour, {user?.name}</span>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-primary-200">
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors"
                >
                  Inscription
                </Link>
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
                  <span className="text-sm">Bonjour, {user?.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors self-start"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-primary-200">
                    Connexion
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white text-primary-600 px-4 py-2 rounded-md hover:bg-primary-100 transition-colors self-start"
                  >
                    Inscription
                  </Link>
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
