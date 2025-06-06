import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import VolunteerSidebar from '../VolunteerSidebar';
import Header from './Header';
import Footer from './Footer';

export default function VolunteerLayout({ children }) {
  const router = useRouter();
  const { user, loading, isVolunteer } = useAuth();
  // Initialize with sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Fonction pour gérer l'état de collapse du sidebar
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };
  
  // Vérification de l'authentification et du rôle bénévole
  useEffect(() => {
    if (!loading && user) {
      if (!isVolunteer()) {
        router.push('/login');
      }
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router, isVolunteer]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <VolunteerSidebar onCollapse={handleSidebarCollapse} />
        <div 
          className="volunteer-content flex-grow transition-all duration-300" 
          style={{ marginLeft: sidebarCollapsed ? '60px' : '220px' }}
        >
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
