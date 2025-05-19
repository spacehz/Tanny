import { useState, useEffect } from 'react';
import { updateCollectedItems, addAssignmentImages } from '../services/assignmentService';

/**
 * Modal pour la saisie des produits collectés
 */
export default function CollectionEntryModal({ assignment, isOpen, onClose, onUpdate }) {
  const [collectedItems, setCollectedItems] = useState([]);
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialiser les produits collectés à partir de l'affectation
  useEffect(() => {
    if (assignment) {
      // Si des produits collectés existent déjà, les utiliser
      if (assignment.collectedItems && assignment.collectedItems.length > 0) {
        setCollectedItems(assignment.collectedItems);
      } 
      // Sinon, initialiser à partir des produits prévus
      else if (assignment.items && assignment.items.length > 0) {
        setCollectedItems(
          assignment.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            validated: false
          }))
        );
      }

      // Initialiser la note si elle existe
      if (assignment.note) {
        setNote(assignment.note);
      }
    }
  }, [assignment]);

  // Gérer la validation d'un produit
  const handleValidateItem = (index) => {
    const updatedItems = [...collectedItems];
    updatedItems[index].validated = !updatedItems[index].validated;
    setCollectedItems(updatedItems);
  };

  // Gérer la modification de la quantité d'un produit
  const handleQuantityChange = (index, value) => {
    const updatedItems = [...collectedItems];
    updatedItems[index].quantity = parseFloat(value) || 0;
    updatedItems[index].validated = true; // Marquer comme validé si la quantité est modifiée
    setCollectedItems(updatedItems);
  };

  // Gérer l'ajout d'images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Prévisualiser la première image
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
    
    // Convertir les fichiers en objets d'image
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file), // Temporaire pour la prévisualisation
      file, // Conserver le fichier pour l'upload ultérieur
      description: '',
      uploadedAt: new Date()
    }));
    
    setImages([...images, ...newImages]);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mettre à jour les produits collectés
      await updateCollectedItems(assignment._id, collectedItems);
      
      // Ajouter les images si nécessaire
      if (images.length > 0) {
        // Dans une application réelle, il faudrait d'abord uploader les images sur un serveur
        // et récupérer les URLs avant de les envoyer à l'API
        const uploadedImages = images.map(image => ({
          url: image.url,
          description: image.description,
          uploadedAt: image.uploadedAt
        }));
        
        await addAssignmentImages(assignment._id, uploadedImages);
      }
      
      // Notifier le parent de la mise à jour
      if (onUpdate) {
        onUpdate();
      }
      
      // Fermer le modal
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des produits collectés:', error);
      setError('Erreur lors de la mise à jour des produits collectés. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !assignment) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Saisie des produits collectés</h2>
        
        {/* Informations sur l'affectation */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">Commerçant: {assignment.merchant?.businessName || 'Non spécifié'}</p>
          <p className="text-sm text-gray-600">
            {assignment.merchant?.address?.street 
              ? `${assignment.merchant.address.street}, ${assignment.merchant.address.city || ''} ${assignment.merchant.address.postalCode || ''}` 
              : (typeof assignment.merchant?.address === 'string' ? assignment.merchant.address : 'Adresse non spécifiée')}
          </p>
        </div>
        
        {/* Liste des produits */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Produits à collecter</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité prévue
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité collectée
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectedItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="ml-2">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={item.validated}
                        onChange={() => handleValidateItem(index)}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Upload d'images */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Photos des produits collectés</h3>
          
          <div className="flex items-center space-x-4">
            <label className="flex flex-col items-center justify-center w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <p className="text-xs text-gray-500">Ajouter une photo</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload}
              />
            </label>
            
            {/* Prévisualisation des images */}
            {imagePreview && (
              <div className="w-32 h-32 relative">
                <img 
                  src={imagePreview} 
                  alt="Prévisualisation" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <button 
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => {
                    setImagePreview(null);
                    setImages([]);
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            {images.length > 0 
              ? `${images.length} image${images.length > 1 ? 's' : ''} sélectionnée${images.length > 1 ? 's' : ''}` 
              : 'Aucune image sélectionnée'}
          </p>
        </div>
        
        {/* Note */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Note</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="3"
            placeholder="Ajouter une note (facultatif)"
          ></textarea>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
