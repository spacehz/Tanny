import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { getMerchantDonations } from '../services/donationService';
import { toast } from 'react-toastify';
import DonationStats from '../components/DonationStats';

const MerchantDonations = () => {
  const { user, isAuthenticated, isMerchant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('history'); // 'history' ou 'stats'
  
  // Utiliser des références pour suivre l'état sans créer de dépendances cycliques
  const currentPageRef = useRef(currentPage);
  const hasCheckedAccessRef = useRef(false);
  const hasCheckedReferrerRef = useRef(false);
  
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
          router.push('/login?role=merchant&redirect=%2Fmerchant-donations');
        } else {
          // Vérifier si l'utilisateur est un commerçant
          console.log('Vérification des droits d\'accès:');
          console.log('Utilisateur:', user);
          console.log('Rôle:', user?.role);
          console.log('Est commerçant (fonction isMerchant)?', isMerchant());
          console.log('Est commerçant (vérification directe)?', checkIsMerchant());
          
          // Vérifier si l'email correspond à notre commerçant de test
          const isTestMerchant = user?.email === 'boulangerie@tany.org';
          
          if (!checkIsMerchant() && !isTestMerchant) {
            // Rediriger vers la page d'accueil si authentifié mais pas commerçant
            console.log('L\'utilisateur n\'est pas un commerçant, redirection...');
            router.push('/');
          } else {
            console.log('L\'utilisateur est un commerçant, accès autorisé');
            setLoading(false);
            
            // Ne charger les donations qu'une seule fois au chargement initial
            if (!hasCheckedAccessRef.current) {
              hasCheckedAccessRef.current = true;
              console.log('Chargement initial des donations');
              fetchDonations(currentPage);
            }
          }
        }
      };
      
      if (!hasCheckedAccessRef.current) {
        checkAccess();
      }
    }, 500); // Attendre 500ms pour s'assurer que les données sont chargées
    
    return () => clearTimeout(timer);
    
    // Désactiver temporairement certaines dépendances pour éviter les boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, user]);
  
  // Effet pour rafraîchir les donations lorsque la page change
  useEffect(() => {
    // Mettre à jour la référence quand currentPage change
    currentPageRef.current = currentPage;
    
    // Fonction pour charger les données
    const loadData = () => {
      // Ne charger les données que si nous avons déjà vérifié l'accès
      // et si nous ne sommes pas déjà en train de charger des données
      if (!loading && isAuthenticated && checkIsMerchant() && hasCheckedAccessRef.current && !donationsLoading) {
        console.log(`Chargement des donations pour la page ${currentPageRef.current}`);
        // Utiliser la fonction fetchDonations sans l'ajouter comme dépendance
        fetchDonations(currentPageRef.current);
      }
    };
    
    // Utiliser un délai pour éviter les appels trop fréquents
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
    
    // Désactiver temporairement le rechargement automatique pour éviter les boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);
  
  // Effet pour vérifier si nous venons de la page merchant après avoir fait un don
  useEffect(() => {
    // Vérifier si nous venons de la page merchant (via le referrer)
    const checkReferrer = () => {
      if (typeof window !== 'undefined' && !hasCheckedReferrerRef.current) {
        hasCheckedReferrerRef.current = true; // Marquer comme vérifié
        
        const referrer = document.referrer;
        const fromMerchant = referrer.includes('/merchant') && !referrer.includes('/merchant-donations');
        
        if (fromMerchant && !loading && isAuthenticated) {
          console.log('Navigation depuis la page merchant, rafraîchissement des donations...');
          // Utiliser la fonction fetchDonations directement sans l'ajouter comme dépendance
          fetchDonations(1); // Rafraîchir la première page
          
          // Afficher un message de bienvenue
          toast.info('Bienvenue sur la page de vos dons. Votre liste a été rafraîchie.');
        }
      }
    };
    
    if (!loading && isAuthenticated) {
      checkReferrer();
    }
    
    // Désactiver temporairement les dépendances pour éviter les boucles infinies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Récupérer les donations du commerçant
  const fetchDonations = useCallback(async (page, showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setDonationsLoading(true);
      }
      
      // Vérifier si l'utilisateur est authentifié
      if (!isAuthenticated || !user || !user._id) {
        console.log('Utilisateur non authentifié ou sans ID valide');
        setDonations([]);
        setTotalPages(1);
        return null;
      }
      
      console.log(`Récupération des donations pour la page ${page}, utilisateur ID: ${user._id}`);
      
      const options = {
        page,
        limit: itemsPerPage
      };
      
      const response = await getMerchantDonations(options);
      console.log('Donations récupérées:', response);
      
      // Vérifier si la réponse contient une erreur
      if (response && response.error) {
        console.error('Erreur dans la réponse:', response.error);
        toast.error(`Erreur lors du chargement des donations: ${response.error}`);
        setDonations([]);
        setTotalPages(1);
        return null;
      }
      
      if (response && response.donations) {
        setDonations(response.donations);
        setTotalPages(response.pages || 1);
        
        // Si aucune donation n'est trouvée mais que nous ne sommes pas sur la première page,
        // revenir à la première page SANS rappeler fetchDonations pour éviter les boucles
        if (response.donations.length === 0 && page > 1) {
          console.log('Aucune donation trouvée sur la page', page, 'retour à la page 1');
          // Utiliser setTimeout pour éviter les problèmes de mise à jour d'état pendant le rendu
          setTimeout(() => {
            setCurrentPage(1);
          }, 0);
          // Ne pas rappeler fetchDonations ici pour éviter les boucles infinies
        }
      } else {
        setDonations([]);
        setTotalPages(1);
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des donations:', error);
      
      // Afficher un message d'erreur plus précis
      if (error.response && error.response.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push('/login?session=expired');
        }, 2000);
      } else if (error.message && error.message.includes('Network Error')) {
        toast.error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        toast.error('Impossible de charger vos donations');
      }
      
      setDonations([]);
      return null;
    } finally {
      if (showLoadingIndicator) {
        setDonationsLoading(false);
      }
    }
  }, [itemsPerPage, router]);

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
    currentPageRef.current = page;
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn(`Date invalide: ${dateString}`);
        return "Date invalide";
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error(`Erreur lors du formatage de la date ${dateString}:`, error);
      return "Erreur de date";
    }
  };

  // Obtenir le statut de la donation
  const getDonationStatus = (donation) => {
    if (!donation.status) return "En attente";
    
    const statusMap = {
      'pending': 'En attente',
      'accepted': 'Accepté',
      'collected': 'Collecté',
      'cancelled': 'Annulé'
    };
    
    return statusMap[donation.status] || donation.status;
  };

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    const statusClassMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'collected': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
  };

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
        <title>Mes Dons | TANY</title>
        <meta name="description" content="Historique de vos dons sur la plateforme TANY" />
      </Head>

      <div className="w-full max-w-full mx-auto px-4 py-4">
        {/* Section d'en-tête avec texte descriptif */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 sm:p-10 mb-10 text-white">
          <h1 className="text-4xl font-bold mb-6">Historique de vos dons</h1>
          <p className="text-xl mb-4">
            Consultez l'historique de tous vos dons et leur statut actuel.
          </p>
          <p className="text-lg">
            Merci pour votre contribution à la lutte contre le gaspillage alimentaire !
          </p>
        </div>
        
        {/* Navigation entre les vues */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode('history')}
              className={`px-6 py-3 text-base font-medium rounded-l-lg ${
                viewMode === 'history'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Historique
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stats')}
              className={`px-6 py-3 text-base font-medium rounded-r-lg ${
                viewMode === 'stats'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Statistiques
            </button>
          </div>
        </div>

        {/* Afficher les statistiques ou l'historique en fonction du mode */}
        {viewMode === 'stats' ? (
          <DonationStats donations={donations} />
        ) : (
          /* Tableau des donations */
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8 w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary-600">Mes dons</h2>
            <div className="flex items-center space-x-4">
              {donationsLoading ? (
                <div className="flex items-center text-primary-600">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mr-3"></div>
                  <span className="text-lg">Chargement...</span>
                </div>
              ) : (
                <>
                  <div className="text-lg text-gray-500 font-medium">
                    {donations.length} don(s) trouvé(s)
                  </div>
                  <button
                    onClick={() => fetchDonations(currentPage)}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors flex items-center"
                    title="Rafraîchir la liste"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Rafraîchir
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Tableau */}
          <div className="rounded-lg border border-gray-200 w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Événement
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                    Produits
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donationsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-3"></div>
                        <span className="text-gray-600 text-base">Chargement des donations...</span>
                      </div>
                    </td>
                  </tr>
                ) : donations.length > 0 ? (
                  donations.map((donation) => (
                    <tr key={donation._id || `donation-${Math.random()}`} className="hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <div className="text-base text-gray-900">{formatDate(donation.createdAt)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-base font-medium text-gray-900">{donation.event?.title || "Événement non spécifié"}</div>
                        <div className="text-sm text-gray-500">{donation.event?.location || ""}</div>
                      </td>
                      <td className="px-6 py-5">
                        <ul className="list-disc pl-5 text-base text-gray-700">
                          {donation.items && donation.items.length > 0 ? (
                            donation.items.map((item, index) => (
                              <li key={index}>
                                {item.product}: {item.quantity} {item.unit}
                              </li>
                            ))
                          ) : (
                            <li>Aucun produit spécifié</li>
                          )}
                        </ul>
                        {donation.note && (
                          <div className="mt-2 text-sm text-gray-500 italic">
                            Note: {donation.note}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${getStatusClass(donation.status)}`}>
                          {getDonationStatus(donation)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          className="px-3 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap"
                          onClick={() => alert('Fonctionnalité à venir')}
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-base text-gray-500">
                      Aucune donation trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Précédent
                </button>
                
                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => handlePageChange(page + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === page + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Suivant
                </button>
              </nav>
            </div>
          )}
        </div>
        )}
      </div>
    </Layout>
  );
};

export default MerchantDonations;
