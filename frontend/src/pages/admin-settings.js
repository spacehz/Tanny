import Head from 'next/head';
import AdminLayout from '../components/layout/AdminLayout';

export default function SettingsManagement() {
  return (
    <AdminLayout>
      <Head>
        <title>Paramètres | TANY Admin</title>
        <meta name="description" content="Paramètres de l'application TANY" />
      </Head>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">
            Cette page vous permet de configurer les paramètres de l'application.
          </p>
          {/* Contenu à développer */}
        </div>
      </div>
    </AdminLayout>
  );
}
