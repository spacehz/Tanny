import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import IndexLayout from '../components/layout/IndexLayout';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Fonction pour gérer le clic sur les boutons d'accès
  const handleAccessClick = (role, linkUrl) => {
    // Si l'utilisateur est déjà connecté, vérifier son rôle
    if (user) {
      // Normaliser le rôle de l'utilisateur pour faciliter les comparaisons
      const userRole = user.role ? user.role.toLowerCase() : '';
      const isUserAdmin = userRole === 'admin';
      const isUserVolunteer = userRole === 'volunteer' || userRole === 'bénévole' || isUserAdmin;
      const isUserMerchant = userRole === 'merchant' || userRole === 'commercant' || userRole === 'commerçant' || isUserAdmin;
      
      // Vérifier si l'utilisateur a le bon rôle pour accéder à l'espace demandé
      if ((role === 'admin' && isUserAdmin) || 
          (role === 'volunteer' && isUserVolunteer) || 
          (role === 'merchant' && isUserMerchant)) {
        // L'utilisateur a le bon rôle, rediriger directement
        router.push(linkUrl);
      } else {
        // L'utilisateur est connecté mais n'a pas le bon rôle
        alert("Vous n'avez pas les droits nécessaires pour accéder à cet espace.");
      }
    } else {
      // L'utilisateur n'est pas connecté, rediriger vers la page de login avec le rôle requis
      console.log(`Redirection vers login avec role=${role} et redirect=${linkUrl}`);
      router.push(`/login?role=${role}&redirect=${encodeURIComponent(linkUrl)}`);
    }
  };
  
  // Données pour les cartes d'accès
  const accessCards = [
    {
      id: 'admin',
      title: 'Administrateur',
      description: 'Gérez les utilisateurs, les produits et les statistiques de l\'application.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      linkUrl: '/admin',
      color: 'primary'
    },
    {
      id: 'volunteer',
      title: 'Bénévole',
      description: 'Participez aux collectes, gérez les stocks et aidez à la distribution.',
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      linkUrl: '/volunteer',
      color: 'green'
    },
    {
      id: 'merchant',
      title: 'Commerçant',
      description: 'Proposez vos surplus alimentaires et suivez vos contributions.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
      linkUrl: '/merchant',
      color: 'blue'
    }
  ];

  return (
    <IndexLayout>
      <Head>
        <title>TANY - Association de Glanage Alimentaire</title>
        <meta name="description" content="Application web pour l'association de glanage alimentaire TANY" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Important: Utiliser w-full pour occuper tout l'espace disponible */}
      <div className="w-full pt-20 bg-gray-50">
        {/* Centrage des éléments avec mx-auto */}
        <main className="w-full max-w-5xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary-600 mb-4">
              Bienvenue sur TANY
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Association de Glanage Alimentaire
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 mx-auto">
              <p className="text-lg text-gray-700 mb-4">
                Notre mission est de réduire le gaspillage alimentaire en récupérant les surplus 
                et en les redistribuant à ceux qui en ont besoin.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Rejoignez-nous dans cette démarche écologique et solidaire !
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('open-register-modal'))}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Créer un compte
                </button>
              </div>
            </div>
          </div>

          {/* Access Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
              Choisissez votre espace
            </h2>
            
            {/* Grille de cartes d'accès */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
              {accessCards.map((card) => (
                <div 
                  key={card.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="h-48 relative overflow-hidden">
                    {/* Image de la carte */}
                    <img
                      src={card.imageUrl}
                      alt={`Espace ${card.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-primary-600">{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.description}</p>
                    <button 
                      onClick={() => handleAccessClick(card.id, card.linkUrl)}
                      className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Accéder à l'espace {card.title}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Impact Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <p className="text-gray-700">Kilos de nourriture sauvés</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <p className="text-gray-700">Commerçants partenaires</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100+</div>
              <p className="text-gray-700">Bénévoles actifs</p>
            </div>
          </div>
        </main>
        
        {/* Footer - Avec couleur cohérente avec le thème */}
        <footer className="bg-primary-800 text-white py-6">
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-lg font-bold mb-2 text-primary-200">TANY</h3>
                <p className="text-primary-100 text-sm mb-2">Association de glanage alimentaire engagée dans la lutte contre le gaspillage et la précarité.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary-200">Liens rapides</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">Accueil</a></li>
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">À propos</a></li>
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary-200">Espaces</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">Espace bénévole</a></li>
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">Espace commerçant</a></li>
                  <li><a href="#" className="text-primary-100 hover:text-white transition-colors duration-300">Espace administrateur</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2 text-primary-200">Contact</h3>
                <address className="not-italic text-primary-100 text-sm">
                  <p className="mb-1">123 Rue du Glanage</p>
                  <p className="mb-1">75000 Paris</p>
                  <p>contact@tany-association.fr</p>
                </address>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-700 text-center text-primary-200 text-sm">
              <p>&copy; {new Date().getFullYear()} TANY - Association de Glanage Alimentaire. Tous droits réservés.</p>
              <div className="mt-2 flex justify-center space-x-4">
                <a href="#" className="text-primary-300 hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-300 hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-300 hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </IndexLayout>
  );
}
