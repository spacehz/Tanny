import React from 'react';
import { useProducts } from '../services/swrHooks';

const ProductList = () => {
  const { data, error, isLoading, isValidating, mutate } = useProducts();

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> Impossible de charger les produits.</span>
        <button 
          onClick={refreshData}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Produits</h2>
        <button 
          onClick={refreshData}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isValidating}
        >
          {isValidating ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>
      
      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((product) => (
            <div key={product._id || product.id} className="border rounded-lg overflow-hidden shadow-lg">
              {product.image && (
                <div className="h-48 bg-gray-200">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{product.price} €</span>
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded">
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
