import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
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
    <>
      <Head>
        <title>TANY - Association de Glanage Alimentaire</title>
        <meta name="description" content="Application web pour l'association de glanage alimentaire TANY" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container-page">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-primary-600 mb-4">
            Bienvenue sur TANY
          </h1>
          <p className="text-2xl text-center mb-8 text-gray-600">
            Association de Glanage Alimentaire
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-12">
            <p className="text-lg text-gray-700 mb-4 text-center">
              Notre mission est de réduire le gaspillage alimentaire en récupérant les surplus 
              et en les redistribuant à ceux qui en ont besoin.
            </p>
          </div>

          <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800">
            Choisissez votre espace
          </h2>
          
          {/* Grille de cartes d'accès */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
                  <Link 
                    href={card.linkUrl}
                    className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Accéder à l'espace {card.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
