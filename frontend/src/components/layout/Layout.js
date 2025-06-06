import React, { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from '../Sidebar';
import MerchantSidebar from '../MerchantSidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  // Initialize with sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Effet pour s'assurer que le composant est correctement monté côté client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Déterminer quel sidebar afficher en fonction du chemin ou du rôle de l'utilisateur
  const isMerchantPage = router.pathname.startsWith('/merchant') || router.pathname === '/merchant-donations';
  const isAdminPage = router.pathname.startsWith('/admin');
  
  // Fonction pour déterminer si l'utilisateur est un commerçant (avec vérification plus robuste)
  const userIsMerchant = user && (
    user.role?.toLowerCase() === 'commercant' || 
    user.role?.toLowerCase() === 'merchant' || 
    user.role?.toLowerCase() === 'commerçant'
  );
  
  // Fonction pour déterminer si l'utilisateur est un admin
  const userIsAdmin = user && user.role?.toLowerCase() === 'admin';

  // Déterminer si une sidebar est visible
  const hasSidebar = isAuthenticated && ((isMerchantPage || userIsMerchant) || (isAdminPage || userIsAdmin));
  
  // Fonction pour gérer l'état de collapse du sidebar
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Afficher les sidebars en position fixe */}
      {isAuthenticated && mounted && (
        <>
          {/* Afficher la barre latérale du commerçant si on est sur une page merchant */}
          {isMerchantPage && <MerchantSidebar key="merchant-sidebar" onCollapse={handleSidebarCollapse} />}
          {/* Afficher la barre latérale admin si on est sur une page admin */}
          {isAdminPage && <Sidebar key="admin-sidebar" onCollapse={handleSidebarCollapse} />}
        </>
      )}
      
      {/* Contenu principal avec marge à gauche dynamique basée sur l'état du sidebar */}
      <div className="pt-14"> {/* Espace pour le header fixe */}
        <main 
          className="min-h-screen transition-all duration-300"
          style={{ 
            marginLeft: hasSidebar ? (sidebarCollapsed ? '60px' : '220px') : '0' 
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
