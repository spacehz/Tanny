import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../Sidebar';

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  
  // Vérification simple de l'authentification admin (à améliorer avec un vrai système d'auth)
  useEffect(() => {
    // Ici, vous pourriez vérifier si l'utilisateur est connecté et a le rôle admin
    // Si ce n'est pas le cas, rediriger vers la page de connexion
    const storage = getLocalStorage();
    const isAdmin = storage ? storage.getItem('userRole') === 'admin' : false;
    if (!isAdmin) {
      // Commenté pour le développement, à décommenter en production
      // router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <div className="admin-content flex-grow transition-all duration-300">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
