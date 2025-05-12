import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import VolunteersTable from '../components/VolunteersTable';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function VolunteersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
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
  
  const handleAddVolunteer = () => {
    setShowAddModal(true);
  };

  return (
    <>
      <Head>
        <title>Gestion des bénévoles | TANY Admin</title>
        <meta name="description" content="Gestion des bénévoles de l'association TANY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Gestion des bénévoles</h1>
              
              <div className="flex items-center space-x-4">
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
                
                <button 
                  onClick={handleAddVolunteer}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter un bénévole
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <VolunteersTable 
                searchTerm={debouncedSearchTerm} 
                showAddModal={showAddModal}
                setShowAddModal={setShowAddModal}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
