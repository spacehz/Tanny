import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
);

const DonationStats = ({ donations }) => {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [averageItemsPerDonation, setAverageItemsPerDonation] = useState(0);

  useEffect(() => {
    if (!donations || donations.length === 0) {
      return;
    }

    // Calculer les statistiques
    calculateStats(donations);
  }, [donations]);

  const calculateStats = (donations) => {
    // Initialiser les statistiques mensuelles
    const months = {};
    const currentYear = new Date().getFullYear();
    
    // Noms des mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Initialiser tous les mois de l'année en cours
    monthNames.forEach((name, index) => {
      const monthKey = `${currentYear}-${(index + 1).toString().padStart(2, '0')}`;
      months[monthKey] = {
        name: name,
        count: 0,
        items: 0
      };
    });
    
    // Statistiques des produits
    const products = {};
    let totalItemsCount = 0;
    
    // Parcourir toutes les donations
    donations.forEach(donation => {
      const date = new Date(donation.createdAt);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${month}`;
      
      // Incrémenter le compteur pour ce mois
      if (months[monthKey]) {
        months[monthKey].count += 1;
        
        // Compter les articles
        if (donation.items && donation.items.length > 0) {
          donation.items.forEach(item => {
            months[monthKey].items += parseFloat(item.quantity) || 0;
            totalItemsCount += parseFloat(item.quantity) || 0;
            
            // Statistiques par produit
            const productKey = item.product.toLowerCase().trim();
            if (!products[productKey]) {
              products[productKey] = {
                name: item.product,
                quantity: 0,
                unit: item.unit
              };
            }
            products[productKey].quantity += parseFloat(item.quantity) || 0;
          });
        }
      }
    });
    
    // Convertir les objets en tableaux pour l'affichage
    const monthlyStatsArray = Object.values(months);
    
    // Trier les produits par quantité (du plus grand au plus petit)
    const productStatsArray = Object.values(products)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Limiter aux 10 premiers produits
    
    // Calculer les statistiques globales
    const totalDonationsCount = donations.length;
    const avgItemsPerDonation = totalDonationsCount > 0 
      ? (totalItemsCount / totalDonationsCount).toFixed(2) 
      : 0;
    
    // Mettre à jour l'état
    setMonthlyStats(monthlyStatsArray);
    setProductStats(productStatsArray);
    setTotalItems(totalItemsCount);
    setTotalDonations(totalDonationsCount);
    setAverageItemsPerDonation(avgItemsPerDonation);
  };

  // Configuration du graphique à barres pour les donations mensuelles
  const barChartData = {
    labels: monthlyStats.map(month => month.name),
    datasets: [
      {
        label: 'Nombre de donations',
        data: monthlyStats.map(month => month.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Quantité totale d\'articles',
        data: monthlyStats.map(month => month.items),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Donations par mois',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Configuration du graphique circulaire pour les produits
  const pieChartData = {
    labels: productStats.map(product => product.name),
    datasets: [
      {
        data: productStats.map(product => product.quantity),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
          'rgba(210, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 199, 199, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Répartition des produits donnés',
        font: {
          size: 16
        }
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-primary-600 mb-6">Statistiques de vos dons</h2>
      
      {donations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucune donnée disponible pour générer des statistiques.
        </div>
      ) : (
        <>
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Total des dons</h3>
              <p className="text-3xl font-bold">{totalDonations}</p>
              <p className="text-sm mt-2">Nombre total de donations effectuées</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Quantité totale</h3>
              <p className="text-3xl font-bold">{totalItems.toFixed(2)}</p>
              <p className="text-sm mt-2">Quantité totale de produits donnés</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Moyenne par don</h3>
              <p className="text-3xl font-bold">{averageItemsPerDonation}</p>
              <p className="text-sm mt-2">Quantité moyenne de produits par donation</p>
            </div>
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
          
          {/* Tableau récapitulatif */}
          <div className="overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Récapitulatif mensuel</h3>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Mois</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Nombre de dons</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b">Quantité totale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyStats.map((month, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 px-4 text-sm text-gray-900">{month.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{month.count}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{month.items.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DonationStats;
