import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';

const MerchantProducts = () => {
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
    // Attendre un court délai pour s'assurer que les données d'authentification sont chargées
    const timer = setTimeout(() => {
      const checkAccess = async () => {
        if (!isAuthenticated) {
          // Rediriger vers la page de connexion si non authentifié
          router.push('/login?role=merchant&redirect=%2Fmerchant%2Fproducts');
        } else {
          // Vérifier si l'utilisateur est un commerçant
          console.log('Vérification des droits d\'accès:');
          console.log('Utilisateur:', user);
          console.log('Rôle:', user?.role);
          console.log('Est commerçant (vérification directe)?', checkIsMerchant());
          
          // Vérifier si l'email correspond à notre commerçant de test
          const isTestMerchant = user?.email === 'boulangerie@tany.org';
          
          if (!checkIsMerchant() && !isTestMerchant) {
            // Rediriger vers la page d'accueil si authentifié mais pas commerçant
            router.push('/');
            // Suppression de l'alerte pour éviter le popup
          } else {
            setLoading(false);
          }
        }
      };
      
      checkAccess();
    }, 500); // Attendre 500ms pour s'assurer que les données sont chargées
    
    return () => clearTimeout(timer);
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
        <title>Mes Produits | Espace Commerçant TANY</title>
        <meta name="description" content="Gérez les produits que vous proposez pour le glanage" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary-600 mb-4">Mes Produits</h1>
          <p className="text-gray-600 mb-4">
            Gérez les produits que vous proposez pour le glanage.
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
                  Cette fonctionnalité est en cours de développement. Vous pourrez bientôt ajouter et gérer vos produits ici.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-500">Aucun produit disponible</h2>
            <p className="mt-2 text-sm text-gray-400">Vous pourrez bientôt ajouter vos produits ici.</p>
            <button 
              className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Ajouter un produit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantProducts;
