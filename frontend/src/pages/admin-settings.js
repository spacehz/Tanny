import Head from 'next/head';
import Sidebar from '../components/Sidebar';

export default function SettingsManagement() {
  return (
    <>
      <Head>
        <title>Paramètres | TANNY Admin</title>
        <meta name="description" content="Paramètres de l'application TANNY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700">
                Cette page vous permet de configurer les paramètres de l'application.
              </p>
              {/* Contenu à développer */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
