import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const RegisterModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const initialFormData = {
    // Champs communs
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    
    // Champs spécifiques aux bénévoles
    availability: 'Flexible',
    address: '',
    
    // Champs spécifiques aux commerçants
    businessName: '',
    siret: '',
    legalRepresentative: {
      firstName: '',
      lastName: ''
    },
    merchantAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    }
  };
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();
  
  // Réinitialiser le formulaire quand le modal est fermé
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setUserType('');
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Effacer le message d'erreur pour ce champ
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    } else if (name.includes('.')) {
      // Pour les champs imbriqués, vérifier si une erreur existe
      const fullFieldName = name;
      if (errors[fullFieldName]) {
        setErrors({
          ...errors,
          [fullFieldName]: null
        });
      }
    }
    
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

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!userType) {
      newErrors.userType = 'Veuillez sélectionner un type de compte';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (setErrorMessages = true) => {
    const newErrors = {};
    
    if (userType === 'merchant') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Le nom commercial est requis';
      }
      
      if (!formData.siret.trim()) {
        newErrors.siret = 'Le numéro SIRET est requis';
      } else if (!/^[0-9]{14}$/.test(formData.siret)) {
        newErrors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
      }
      
      if (!formData.legalRepresentative.firstName.trim()) {
        newErrors['legalRepresentative.firstName'] = 'Le prénom du représentant légal est requis';
      }
      
      if (!formData.legalRepresentative.lastName.trim()) {
        newErrors['legalRepresentative.lastName'] = 'Le nom du représentant légal est requis';
      }
      
      if (!formData.merchantAddress.street.trim()) {
        newErrors['merchantAddress.street'] = 'La rue est requise';
      }
      
      if (!formData.merchantAddress.city.trim()) {
        newErrors['merchantAddress.city'] = 'La ville est requise';
      }
      
      if (!formData.merchantAddress.postalCode.trim()) {
        newErrors['merchantAddress.postalCode'] = 'Le code postal est requis';
      }
    } else {
      if (!formData.address.trim()) {
        newErrors.address = 'L\'adresse est requise';
      }
    }
    
    // Ne définir les erreurs que si setErrorMessages est true
    if (setErrorMessages) {
      setErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      // Effacer les erreurs avant de changer d'étape
      setErrors({});
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      // Effacer les erreurs avant de changer d'étape
      setErrors({});
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    // Effacer les erreurs lors du changement d'étape
    setErrors({});
  };

  // Empêcher la propagation des clics sur le formulaire vers l'overlay
  const handleFormClick = (e) => {
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    console.log('Current step:', step);
    console.log('Validation result:', validateStep3(false));
    
    if (step === 3 && validateStep3(true)) {
      console.log('Validation passed, proceeding with registration');
      setLoading(true);
      
      try {
        // Préparer les données selon le type d'utilisateur
        let userData = {};
        
        if (userType === 'merchant') {
          // Pour les commerçants, nous utilisons le modèle Merchant
          // Assurons-nous que les données correspondent au schéma Merchant
          userData = {
            businessName: formData.businessName,
            legalRepresentative: {
              firstName: formData.legalRepresentative.firstName,
              lastName: formData.legalRepresentative.lastName
            },
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            siret: formData.siret,
            address: {
              street: formData.merchantAddress.street,
              city: formData.merchantAddress.city,
              postalCode: formData.merchantAddress.postalCode,
              country: 'France'
            },
            password: formData.password,
            name: formData.name, // Ajout du nom pour l'utilisateur associé
            role: 'commercant' // Correspond à 'commercant' dans le modèle User
          };
        } else {
          // Pour les bénévoles, nous utilisons le modèle User
          // Assurons-nous que les données correspondent au schéma User
          userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            availability: formData.availability,
            role: 'bénévole' // Correspond à 'bénévole' dans le modèle User
          };
        }
        
        // Afficher un message de débogage dans la console
        console.log('Données d\'inscription:', userData);
        
        // Tester l'API directement pour voir si le problème vient du service d'authentification
        try {
          console.log('Test direct de l\'API...');
          const api = await import('../services/api').then(module => module.default);
          
          if (userType === 'merchant') {
            // Créer d'abord le commerçant
            const merchantData = {
              businessName: userData.businessName,
              legalRepresentative: userData.legalRepresentative,
              email: userData.email,
              phoneNumber: userData.phoneNumber,
              siret: userData.siret,
              address: userData.address
            };
            
            console.log('Test API: création du commerçant avec les données:', merchantData);
            const merchantResponse = await api.post('/api/merchants', merchantData);
            console.log('Test API: réponse de création du commerçant:', merchantResponse);
            
            // Puis créer l'utilisateur associé
            const userAccountData = {
              name: userData.name,
              email: userData.email,
              password: userData.password,
              role: 'commercant',
              businessName: userData.businessName
            };
            
            console.log('Test API: création de l\'utilisateur avec les données:', userAccountData);
            const userResponse = await api.post('/api/users/register', userAccountData);
            console.log('Test API: réponse de création de l\'utilisateur:', userResponse);
          } else {
            console.log('Test API: création du bénévole avec les données:', userData);
            const response = await api.post('/api/users/register', userData);
            console.log('Test API: réponse de création du bénévole:', response);
          }
        } catch (apiError) {
          console.error('Test API: erreur lors de l\'appel direct à l\'API:', apiError);
          if (apiError.response) {
            console.error('Test API: détails de l\'erreur:', apiError.response.data);
          }
        }
        
        // Utiliser le service d'authentification normal
        const success = await register(userData);
        
        if (success) {
          // Afficher un message de succès
          alert('Inscription réussie ! Vous allez être redirigé.');
          onClose();
          
          // Redirection selon le type d'utilisateur
          if (userType === 'merchant') {
            router.push('/merchant');
          } else {
            router.push('/volunteer');
          }
        }
      } catch (err) {
        console.error('Erreur d\'inscription:', err);
        setErrors({ submit: err.message || 'Une erreur est survenue lors de l\'inscription' });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-primary-700 text-center mb-6">
        Choisissez votre type de compte
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setUserType('volunteer')}
          className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
            userType === 'volunteer'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-primary-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full ${
              userType === 'volunteer' ? 'bg-primary-100' : 'bg-gray-100'
            } mb-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className={`text-lg font-medium ${userType === 'volunteer' ? 'text-primary-700' : 'text-gray-800'}`}>
              Bénévole
            </h4>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Rejoignez-nous pour participer aux collectes et aider à lutter contre le gaspillage alimentaire
            </p>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => setUserType('merchant')}
          className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
            userType === 'merchant'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-primary-300'
          }`}
        >
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full ${
              userType === 'merchant' ? 'bg-primary-100' : 'bg-gray-100'
            } mb-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h4 className={`text-lg font-medium ${userType === 'merchant' ? 'text-primary-700' : 'text-gray-800'}`}>
              Commerçant
            </h4>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Proposez vos invendus et contribuez à réduire le gaspillage alimentaire
            </p>
          </div>
        </button>
      </div>
      
      {errors.userType && (
        <p className="text-red-500 text-sm mt-2 text-center bg-red-50 p-2 rounded-md">{errors.userType}</p>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-medium text-primary-700 text-center mb-6">
        Informations personnelles
      </h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Entrez votre nom complet"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.name 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Adresse email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@email.com"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Numéro de téléphone
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="06 12 34 56 78"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.phoneNumber 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 caractères"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.password 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.confirmPassword 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  );

  const renderStep3Volunteer = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-medium text-primary-700 text-center mb-6">
        Informations complémentaires
      </h3>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Adresse
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Votre adresse complète"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.address 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
          Disponibilité
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 focus:outline-none appearance-none bg-white transition-colors text-black"
          >
            <option value="Flexible">Flexible</option>
            <option value="Matin">Matin</option>
            <option value="Après-midi">Après-midi</option>
            <option value="Soir">Soir</option>
            <option value="Week-end">Week-end</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="bg-primary-50 p-4 rounded-lg border border-primary-200 mt-6">
        <h4 className="text-primary-700 font-medium mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informations importantes
        </h4>
        <p className="text-sm text-gray-600">
          En tant que bénévole, vous pourrez participer aux collectes et aider à la distribution des invendus. Votre disponibilité nous aidera à organiser au mieux les actions sur le terrain.
        </p>
      </div>
    </div>
  );

  const renderStep3Merchant = () => (
    <div className="space-y-5">
      <h3 className="text-xl font-medium text-primary-700 text-center mb-6">
        Informations commerciales
      </h3>
      
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
          Nom commercial
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <input
            type="text"
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Nom de votre commerce"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.businessName 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.businessName && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
          Numéro SIRET (14 chiffres)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <input
            type="text"
            id="siret"
            name="siret"
            value={formData.siret}
            onChange={handleChange}
            placeholder="14 chiffres sans espaces"
            className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors.siret 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
        </div>
        {errors.siret && (
          <p className="mt-1 text-sm text-red-600">{errors.siret}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="legalRepresentative.firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Prénom du représentant légal
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              id="legalRepresentative.firstName"
              name="legalRepresentative.firstName"
              value={formData.legalRepresentative.firstName}
              onChange={handleChange}
              placeholder="Prénom"
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
                errors['legalRepresentative.firstName'] 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              }`}
            />
          </div>
          {errors['legalRepresentative.firstName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['legalRepresentative.firstName']}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="legalRepresentative.lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du représentant légal
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              type="text"
              id="legalRepresentative.lastName"
              name="legalRepresentative.lastName"
              value={formData.legalRepresentative.lastName}
              onChange={handleChange}
              placeholder="Nom"
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
                errors['legalRepresentative.lastName'] 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              }`}
            />
          </div>
          {errors['legalRepresentative.lastName'] && (
            <p className="mt-1 text-sm text-red-600">{errors['legalRepresentative.lastName']}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-md font-medium text-primary-700 mb-3">Adresse du commerce</h4>
        <div>
          <label htmlFor="merchantAddress.street" className="block text-sm font-medium text-gray-700 mb-1">
            Rue
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="merchantAddress.street"
              name="merchantAddress.street"
              value={formData.merchantAddress.street}
              onChange={handleChange}
              placeholder="Numéro et nom de rue"
              className={`pl-10 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
                errors['merchantAddress.street'] 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
              }`}
            />
          </div>
          {errors['merchantAddress.street'] && (
            <p className="mt-1 text-sm text-red-600">{errors['merchantAddress.street']}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="merchantAddress.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Code postal
          </label>
          <input
            type="text"
            id="merchantAddress.postalCode"
            name="merchantAddress.postalCode"
            value={formData.merchantAddress.postalCode}
            onChange={handleChange}
            placeholder="Ex: 75001"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors['merchantAddress.postalCode'] 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors['merchantAddress.postalCode'] && (
            <p className="mt-1 text-sm text-red-600">{errors['merchantAddress.postalCode']}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="merchantAddress.city" className="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <input
            type="text"
            id="merchantAddress.city"
            name="merchantAddress.city"
            value={formData.merchantAddress.city}
            onChange={handleChange}
            placeholder="Ex: Paris"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors text-black ${
              errors['merchantAddress.city'] 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
            }`}
          />
          {errors['merchantAddress.city'] && (
            <p className="mt-1 text-sm text-red-600">{errors['merchantAddress.city']}</p>
          )}
        </div>
      </div>
      
      <div className="bg-primary-50 p-4 rounded-lg border border-primary-200 mt-6">
        <h4 className="text-primary-700 font-medium mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informations importantes
        </h4>
        <p className="text-sm text-gray-600">
          En tant que commerçant, vous pourrez proposer vos invendus sur la plateforme. Vos informations commerciales sont nécessaires pour la facturation et la conformité légale.
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    // Ensure no errors are displayed when initially rendering step 3
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    
    if (userType === 'merchant') {
      return renderStep3Merchant();
    }
    return renderStep3Volunteer();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
        } font-bold text-lg transition-all duration-300`}>
          1
        </div>
        <div className={`h-1 w-16 mx-2 rounded ${
          step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
        } transition-all duration-300`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
        } font-bold text-lg transition-all duration-300`}>
          2
        </div>
        <div className={`h-1 w-16 mx-2 rounded ${
          step >= 3 ? 'bg-primary-600' : 'bg-gray-200'
        } transition-all duration-300`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
          step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
        } font-bold text-lg transition-all duration-300`}>
          3
        </div>
      </div>
      <div className="flex justify-center mt-2 text-sm text-gray-600">
        <span className={`w-10 text-center ${step === 1 ? 'font-medium text-primary-600' : ''}`}>Type</span>
        <span className="w-16"></span>
        <span className={`w-10 text-center ${step === 2 ? 'font-medium text-primary-600' : ''}`}>Profil</span>
        <span className="w-16"></span>
        <span className={`w-10 text-center ${step === 3 ? 'font-medium text-primary-600' : ''}`}>Détails</span>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6 bg-gradient-to-br from-white to-primary-50">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">
          Créer un compte
        </h2>
        
        {renderStepIndicator()}
        
        <form 
          onSubmit={(e) => {
            console.log('Form onSubmit triggered');
            handleSubmit(e);
          }} 
          className="bg-white p-6 rounded-lg shadow-md"
          onClick={(e) => e.stopPropagation()} // Empêche la propagation des clics vers l'overlay
        >
          {renderStepContent()}
          
          {errors.submit && (
            <div className="mt-4 text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
              {errors.submit}
            </div>
          )}
          
          <div className="mt-6 flex justify-between sticky bottom-0 bg-white py-2 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    S'inscrire
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegisterModal;
