import Head from 'next/head';
import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
  return (
    <>
      <Head>
        <title>Dashboard Admin | TANNY</title>
        <meta name="description" content="Tableau de bord administrateur de l'application TANNY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Carte statistique - Bénévoles */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Bénévoles</h3>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm text-gray-500 mt-2">+3 ce mois-ci</p>
              </div>
              
              {/* Carte statistique - Commerçants */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Commerçants</h3>
                <p className="text-3xl font-bold">18</p>
                <p className="text-sm text-gray-500 mt-2">+2 ce mois-ci</p>
              </div>
              
              {/* Carte statistique - Collectes */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Collectes</h3>
                <p className="text-3xl font-bold">42</p>
                <p className="text-sm text-gray-500 mt-2">12 à venir</p>
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
        </div>
      </div>
    </>
  );
}
