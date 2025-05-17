import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { getMerchantDonations } from '../services/donationService';
import { toast } from 'react-toastify';
import ProtectedRoute from '../components/ProtectedRoute';
import MerchantSidebar from '../components/MerchantSidebar';

const MerchantDonationsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Récupérer les dons du commerçant
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await getMerchantDonations({
          page: currentPage,
          limit: 10
        });
        
        if (response && response.donations) {
          setDonations(response.donations);
          setTotalPages(response.pages || 1);
        } else {
          setDonations([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des dons:', error);
        toast.error('Impossible de charger vos dons');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDonations();
    }
  }, [user, currentPage]);

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
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

  // Obtenir le statut traduit
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmé',
      'collected': 'Collecté',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  // Obtenir la classe CSS pour le statut
  const getStatusClass = (status) => {
    const statusClassMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'collected': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute requiredRole="merchant">
      <Layout>
        <Head>
          <title>Mes dons | TANY</title>
        </Head>
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Historique de mes dons</h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Chargement...</span>
              </div>
            </div>
          ) : donations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">Vous n'avez pas encore fait de dons.</p>
              <button 
                onClick={() => router.push('/merchant')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Voir les collectes à venir
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collecte
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articles
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.event?.title || 'Collecte non spécifiée'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.event?.location || 'Lieu non spécifié'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="text-sm text-gray-500 list-disc list-inside">
                            {donation.items.map((item, index) => (
                              <li key={index}>
                                {item.product} - {item.quantity} {item.unit}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(donation.status)}`}>
                            {getStatusLabel(donation.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default MerchantDonationsPage;
