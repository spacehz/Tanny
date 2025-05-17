import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

const MerchantStats = () => {
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
        router.push('/login?role=merchant&redirect=%2Fmerchant%2Fstats');
      } else {
        // Vérifier si l'utilisateur est un commerçant
        if (!checkIsMerchant()) {
          // Rediriger vers la page d'accueil si authentifié mais pas commerçant
          router.push('/');
          alert("Vous n'avez pas les droits nécessaires pour accéder à cet espace.");
        } else {
          setLoading(false);
        }
      }
    };
    
    if (!loading) {
      checkAccess();
    }
  }, [isAuthenticated, loading, router, user]);

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
        <title>Statistiques | Espace Commerçant TANY</title>
        <meta name="description" content="Visualisez l'impact de vos dons et contributions" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary-600 mb-4">Statistiques</h1>
          <p className="text-gray-600 mb-4">
            Visualisez l'impact de vos dons et contributions.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Cette fonctionnalité est en cours de développement. Vous pourrez bientôt visualiser vos statistiques ici.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total des dons</h3>
              <p className="text-3xl font-bold text-primary-600">0 kg</p>
              <p className="text-sm text-gray-500 mt-2">Depuis votre inscription</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Collectes réalisées</h3>
              <p className="text-3xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-500 mt-2">Depuis votre inscription</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Impact environnemental</h3>
              <p className="text-3xl font-bold text-green-600">0 kg CO₂</p>
              <p className="text-sm text-gray-500 mt-2">Émissions évitées</p>
            </div>
          </div>
          
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-500">Aucune donnée disponible</h2>
            <p className="mt-2 text-sm text-gray-400">Les statistiques apparaîtront ici une fois que vous aurez effectué des dons.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantStats;
