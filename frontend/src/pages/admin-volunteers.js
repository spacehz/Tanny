import Head from 'next/head';
import AdminLayout from '../components/layout/AdminLayout';
import VolunteersTable from '../components/VolunteersTable';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function VolunteersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const router = useRouter();
  
  // Effet pour débouncer la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestion des bénévoles | TANY Admin</title>
        <meta name="description" content="Gestion des bénévoles de l'association TANY" />
      </Head>

      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des bénévoles</h1>
          
          <div className="flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un bénévole..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={handleSearch}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <VolunteersTable 
            searchTerm={debouncedSearchTerm}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
