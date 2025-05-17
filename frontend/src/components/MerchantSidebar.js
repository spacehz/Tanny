import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Icônes (utilisation de SVG inline pour simplicité)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CollectionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function MerchantSidebar() {
  // État pour suivre si le composant est monté
  const [mounted, setMounted] = useState(false);
  
  // Effet pour s'assurer que le composant est correctement monté côté client
  useEffect(() => {
    setMounted(true);
    console.log('MerchantSidebar mounted');
    return () => {
      console.log('MerchantSidebar unmounted');
      setMounted(false);
    };
  }, []);
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Icône pour les dons
const DonationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 112.76 3.77c.08-.65.14-1.3.14-1.77V6a4 4 0 00-8 0v7H4.5m8 5l-5-5m0 0l5-5m-5 5h10" />
  </svg>
);

const menuItems = [
    {
      name: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/merchant',
    },
    {
      name: 'Mes Produits',
      icon: <ProductsIcon />,
      path: '/merchant/products',
    },
    {
      name: 'Collectes',
      icon: <CollectionsIcon />,
      path: '/merchant/collections',
    },
    {
      name: 'Mes Dons',
      icon: <DonationsIcon />,
      path: '/merchant-donations',
    },
    {
      name: 'Statistiques',
      icon: <StatsIcon />,
      path: '/merchant/stats',
    },
    {
      name: 'Mon Profil',
      icon: <ProfileIcon />,
      path: '/merchant/profile',
    },
  ];

  return (
    <div 
      className={`merchant-sidebar ${collapsed ? 'collapsed' : ''} bg-primary-700 text-white h-full min-h-screen fixed left-0 top-0 pt-16 transition-all duration-300 w-64`}
    >
      <div className="flex justify-between items-center p-4 border-b border-primary-600">
        <div className={`${collapsed ? 'hidden' : 'block'} transition-opacity duration-300`}>
          <Link href="/merchant" className="text-xl font-bold">
            Espace Commerçant
          </Link>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 rounded-md hover:bg-primary-600 transition-colors"
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          <MenuIcon />
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            // Vérifier si le chemin actuel correspond exactement ou commence par le chemin de l'élément
            const isActive = router.pathname === item.path || 
                            (item.path !== '/merchant' && router.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className={`${collapsed ? 'hidden' : 'block'} transition-opacity duration-300`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
