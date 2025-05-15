import Head from 'next/head';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import { useDashboardStats } from '../services/swrHooks';

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, isLoading, error } = useDashboardStats();

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <Head>
          <title>Dashboard Admin | TANY</title>
          <meta name="description" content="Tableau de bord administrateur de l'application TANY" />
        </Head>

        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Carte statistique - Bénévoles */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Bénévoles</h3>
              {isLoading ? (
                <p className="text-3xl font-bold">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Erreur de chargement</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats.volunteersCount}</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.newVolunteersThisMonth} ce mois-ci</p>
                </>
              )}
            </div>
            
            {/* Carte statistique - Commerçants */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Commerçants</h3>
              {isLoading ? (
                <p className="text-3xl font-bold">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Erreur de chargement</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats.merchantsCount}</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.newMerchantsThisMonth} ce mois-ci</p>
                </>
              )}
            </div>
            
            {/* Carte statistique - Collectes */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Collectes</h3>
              {isLoading ? (
                <p className="text-3xl font-bold">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Erreur de chargement</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats.collectionsCount}</p>
                  <p className="text-sm text-gray-500 mt-2">{stats.upcomingCollections} à venir</p>
                </>
              )}
            </div>
            
            {/* Carte statistique - Marchés à venir */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Marchés à venir</h3>
              {isLoading ? (
                <p className="text-3xl font-bold">Chargement...</p>
              ) : error ? (
                <p className="text-sm text-red-500">Erreur de chargement</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{stats.upcomingMarketsCount}</p>
                  <p className="text-sm text-gray-500 mt-2">Prochains marchés</p>
                </>
              )}
            </div>
          </div>
          
          {/* Navigation rapide vers les sections admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
              <p className="text-gray-600 mb-4">Gérer les bénévoles et les commerçants</p>
              <button 
                onClick={() => router.push('/admin-volunteers')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Accéder
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Collectes</h2>
              <p className="text-gray-600 mb-4">Gérer les collectes programmées</p>
              <button 
                onClick={() => router.push('/admin-collections')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Accéder
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Configuration</h2>
              <p className="text-gray-600 mb-4">Paramètres de l'application</p>
              <button 
                onClick={() => router.push('/admin-settings')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Accéder
              </button>
            </div>
          </div>
          
          {/* Activités récentes */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Activités récentes</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="border-b pb-3 last:border-b-0">
                  <p className="text-gray-800">Nouvelle collecte programmée par Commerçant {item}</p>
                  <p className="text-sm text-gray-500">Il y a {item} heure{item > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Prochains événements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Prochains événements</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center border-b pb-3 last:border-b-0">
                  <div className="bg-primary-100 text-primary-800 rounded-lg p-3 mr-4">
                    <span className="font-bold">{item + 10}</span>
                    <span className="block text-xs">Nov</span>
                  </div>
                  <div>
                    <p className="font-medium">Collecte au Marché Central</p>
                    <p className="text-sm text-gray-500">10:00 - 12:00</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
