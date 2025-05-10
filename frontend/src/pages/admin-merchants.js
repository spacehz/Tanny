import Head from 'next/head';
import Sidebar from '../components/Sidebar';

export default function MerchantsManagement() {
  return (
    <>
      <Head>
        <title>Gestion des commerçants | TANNY Admin</title>
        <meta name="description" content="Gestion des commerçants partenaires de l'association TANNY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Gestion des commerçants</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700">
                Cette page vous permet de gérer les commerçants partenaires de l'association.
              </p>
              {/* Contenu à développer */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
