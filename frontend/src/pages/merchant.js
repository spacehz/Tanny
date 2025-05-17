import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';

const MerchantDashboard = () => {
  const { user, isAuthenticated, isMerchant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Fonction pour vérifier directement si l'utilisateur est un commerçant
  const checkIsMerchant = () => {
    if (!user) return false;
    
    const role = user.role ? user.role.toLowerCase() : '';
    return role === 'merchant' || role === 'commercant' || role === 'commerçant' || role === 'admin';
  };

  // Vérifier l'authentification et les droits d'accès
  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion si non authentifié
        router.push('/login?role=merchant&redirect=%2Fmerchant');
      } else {
        // Vérifier si l'utilisateur est un commerçant
        console.log('Vérification des droits d\'accès:');
        console.log('Utilisateur:', user);
        console.log('Rôle:', user?.role);
        console.log('Est commerçant (fonction isMerchant)?', isMerchant());
        console.log('Est commerçant (vérification directe)?', checkIsMerchant());
        
        if (!checkIsMerchant()) {
          // Rediriger vers la page d'accueil si authentifié mais pas commerçant
          console.log('L\'utilisateur n\'est pas un commerçant, redirection...');
          router.push('/');
          alert("Vous n'avez pas les droits nécessaires pour accéder à cet espace.");
        } else {
          console.log('L\'utilisateur est un commerçant, accès autorisé');
          setLoading(false);
        }
      }
    };
    
    if (!loading) {
      checkAccess();
    }
  }, [isAuthenticated, isMerchant, loading, router, user]);

  if (loading || !isAuthenticated || !checkIsMerchant()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Espace Commerçant | TANY</title>
        <meta name="description" content="Espace commerçant de l'application TANY" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary-600 mb-4">Bienvenue dans votre espace commerçant</h1>
          <p className="text-gray-600 mb-4">
            Gérez vos informations et suivez vos interactions avec l'association TANY.
          </p>
          
          {user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Informations du compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom commercial</p>
                  <p className="font-medium">{user.businessName || user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte pour les produits */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Mes Produits</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Gérez les produits que vous proposez pour le glanage.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir mes produits
            </button>
          </div>

          {/* Carte pour les collectes */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Collectes</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Consultez l'historique des collectes effectuées dans votre commerce.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir les collectes
            </button>
          </div>

          {/* Carte pour les statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Statistiques</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Visualisez l'impact de vos dons et contributions.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantDashboard;
