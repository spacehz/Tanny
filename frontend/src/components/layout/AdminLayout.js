import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

// Helper function to safely access localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  // Vérification de l'authentification admin
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et a le rôle admin
    if (user && !isAdmin) {
      router.push('/login');
    }
  }, [user, isAdmin, router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header en haut de la page */}
      <Header />
      
      <div className="flex flex-1">
        {/* Sidebar à gauche */}
        <Sidebar />
        
        {/* Contenu principal */}
        <div className="admin-content flex-grow ml-64 transition-all duration-300 pt-16">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
