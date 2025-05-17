import React from 'react';
import Header from './Header';
import Sidebar from '../Sidebar';
import MerchantSidebar from '../MerchantSidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Déterminer quel sidebar afficher en fonction du chemin ou du rôle de l'utilisateur
  const isMerchantPage = router.pathname.startsWith('/merchant');
  const isAdminPage = router.pathname.startsWith('/admin');
  
  // Fonction pour déterminer si l'utilisateur est un commerçant
  const userIsMerchant = user && (user.role === 'commercant' || user.role === 'merchant' || user.role === 'commerçant');
  
  // Fonction pour déterminer si l'utilisateur est un admin
  const userIsAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        {isAuthenticated && (
          <>
            {/* Afficher la sidebar appropriée en fonction du contexte */}
            {(isMerchantPage || userIsMerchant) && !isAdminPage && <MerchantSidebar />}
            {(isAdminPage || userIsAdmin) && <Sidebar />}
          </>
        )}
        
        <main className={`flex-1 ${isAuthenticated ? 'ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
