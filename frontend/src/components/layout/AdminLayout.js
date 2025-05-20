import { useState, useEffect } from 'react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
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
        <Sidebar onCollapse={(collapsed) => setSidebarCollapsed(collapsed)} />
        
        {/* Contenu principal - ajustement dynamique en fonction de l'état de la sidebar */}
        <div 
          className={`admin-content flex-grow transition-all duration-300 pt-16 ${
            sidebarCollapsed ? 'ml-[60px]' : 'ml-[220px]'
          }`}
        >
          <main className="px-6 py-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
