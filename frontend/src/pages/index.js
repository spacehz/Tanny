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
                <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-8 rounded-lg transition-colors">
                  Rejoindre l'aventure
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
        
        {/* Footer - Réduction de la taille */}
        <footer className="bg-gray-800 text-white py-6">
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-lg font-bold mb-2">TANY</h3>
                <p className="text-gray-300 text-sm mb-2">Association de glanage alimentaire engagée dans la lutte contre le gaspillage et la précarité.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Liens rapides</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Accueil</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">À propos</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Espaces</h3>
                <ul className="space-y-1 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-white">Espace bénévole</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Espace commerçant</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white">Espace administrateur</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">Contact</h3>
                <address className="not-italic text-gray-300 text-sm">
                  <p className="mb-1">123 Rue du Glanage</p>
                  <p className="mb-1">75000 Paris</p>
                  <p>contact@tany-association.fr</p>
                </address>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} TANY - Association de Glanage Alimentaire. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </div>
    </IndexLayout>
  );
}
