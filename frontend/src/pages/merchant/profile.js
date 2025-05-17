import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import { toast } from 'react-hot-toast';

const MerchantProfile = () => {
  const { user, isAuthenticated, isMerchant, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Fonction pour vérifier directement si l'utilisateur est un commerçant
  const checkIsMerchant = () => {
    if (!user) return false;
    
    const role = user.role ? user.role.toLowerCase() : '';
    return role === 'merchant' || role === 'commercant' || role === 'commerçant' || role === 'admin';
  };
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    legalRepresentative: {
      firstName: '',
      lastName: ''
    },
    siret: ''
  });

  // Vérifier l'authentification et les droits d'accès
  useEffect(() => {
    // Attendre un court délai pour s'assurer que les données d'authentification sont chargées
    const timer = setTimeout(() => {
      const checkAccess = async () => {
        if (!isAuthenticated) {
          // Rediriger vers la page de connexion si non authentifié
          router.push('/login?role=merchant&redirect=%2Fmerchant%2Fprofile');
        } else {
          // Vérifier si l'utilisateur est un commerçant
          console.log('Vérification des droits d\'accès:');
          console.log('Utilisateur:', user);
          console.log('Rôle:', user?.role);
          
          // Vérifier si l'email correspond à notre commerçant de test
          const isTestMerchant = user?.email === 'boulangerie@tany.org';
          
          if (!checkIsMerchant() && !isTestMerchant) {
            // Rediriger vers la page d'accueil si authentifié mais pas commerçant
            router.push('/');
            // Suppression de l'alerte pour éviter le popup
          } else if (user) {
            // Remplir le formulaire avec les données de l'utilisateur
            setFormData({
              businessName: user.businessName || '',
              email: user.email || '',
              phoneNumber: user.phoneNumber || '',
              address: user.address || {
                street: '',
                city: '',
                postalCode: '',
                country: 'France'
              },
              legalRepresentative: user.legalRepresentative || {
                firstName: '',
                lastName: ''
              },
              siret: user.siret || ''
            });
            setLoading(false);
          }
        }
      };
      
      checkAccess();
    }, 500); // Attendre 500ms pour s'assurer que les données sont chargées
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, router, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gestion des champs imbriqués
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Simuler une mise à jour réussie
      // En production, vous appelleriez updateProfile(formData)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
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
        <title>Mon Profil | Espace Commerçant TANY</title>
        <meta name="description" content="Gérez les informations de votre profil commerçant" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-primary-600 mb-4">Mon Profil</h1>
          <p className="text-gray-600 mb-6">
            Gérez les informations de votre profil commerçant.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom commercial
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  id="siret"
                  name="siret"
                  value={formData.siret}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Représentant légal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="legalRepresentative.firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="legalRepresentative.firstName"
                    name="legalRepresentative.firstName"
                    value={formData.legalRepresentative.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="legalRepresentative.lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="legalRepresentative.lastName"
                    name="legalRepresentative.lastName"
                    value={formData.legalRepresentative.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Adresse</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                    Rue
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    id="address.postalCode"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Cette fonctionnalité est en cours de développement. Les modifications ne seront pas enregistrées pour le moment.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantProfile;
