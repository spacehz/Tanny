import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

// Fonction pour générer des couleurs aléatoires
const generateColors = (count) => {
  const colors = [];
  const backgroundColors = [];
  
  for (let i = 0; i < count; i++) {
    // Générer une couleur HSL avec une teinte aléatoire, saturation et luminosité fixes
    const hue = (i * 137.5) % 360; // Distribution uniforme des teintes
    const color = `hsl(${hue}, 70%, 45%)`;
    const backgroundColor = `hsla(${hue}, 70%, 45%, 0.7)`;
    
    colors.push(color);
    backgroundColors.push(backgroundColor);
  }
  
  return { colors, backgroundColors };
};

export default function VolunteerStatsCharts({ stats }) {
  // Si aucune statistique n'est disponible, afficher un message
  if (!stats || Object.keys(stats).length === 0) {
    return <div className="text-center py-4">Aucune statistique disponible</div>;
  }
  
  // Préparer les données pour le graphique en camembert des produits collectés
  const prepareProductsData = () => {
    if (!stats.productCategories || Object.keys(stats.productCategories).length === 0) {
      return null;
    }
    
    const labels = Object.keys(stats.productCategories);
    const data = Object.values(stats.productCategories);
    
    // Générer des couleurs pour chaque catégorie
    const { backgroundColors, colors } = generateColors(labels.length);
    
    return {
      labels,
      datasets: [
        {
          label: 'Quantité (kg)',
          data,
          backgroundColor: backgroundColors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Options pour le graphique en camembert
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 10
          }
        }
      },
      title: {
        display: true,
        text: 'Répartition des produits collectés (kg)',
        font: {
          size: 14
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)} kg`;
          }
        }
      }
    }
  };
  
  // Préparer les données pour le graphique radar des compétences
  const prepareSkillsData = () => {
    // Exemple de compétences basées sur les types de produits collectés
    const skills = {
      'Collecte de fruits': Math.min(100, calculateSkillLevel(['Pommes', 'Poires', 'Bananes', 'fruits'])),
      'Collecte de légumes': Math.min(100, calculateSkillLevel(['pomme de terre', 'carottes', 'tomates', 'légumes'])),
      'Participation': Math.min(100, stats.totalParticipationDays * 20),
      'Heures de bénévolat': Math.min(100, stats.totalHours * 10),
      'Missions complétées': Math.min(100, stats.totalCompletedAssignments * 15)
    };
    
    return {
      labels: Object.keys(skills),
      datasets: [
        {
          label: 'Niveau de compétence',
          data: Object.values(skills),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)',
          borderWidth: 2
        }
      ]
    };
  };
  
  // Préparer les données pour le graphique d'évolution mensuelle
  const prepareMonthlyEvolutionData = () => {
    if (!stats.participationByMonth || Object.keys(stats.participationByMonth).length === 0) {
      return null;
    }
    
    // Trier les mois chronologiquement
    const sortedMonths = Object.keys(stats.participationByMonth).sort();
    
    // Formater les étiquettes des mois
    const labels = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });
    
    // Extraire les données
    const daysData = sortedMonths.map(month => stats.participationByMonth[month].days);
    const hoursData = sortedMonths.map(month => Math.round(stats.participationByMonth[month].hours * 10) / 10);
    const assignmentsData = sortedMonths.map(month => stats.participationByMonth[month].assignments);
    
    return {
      labels,
      datasets: [
        {
          label: 'Jours de participation',
          data: daysData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Heures de bénévolat',
          data: hoursData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          yAxisID: 'y1',
          tension: 0.3
        },
        {
          label: 'Collectes complétées',
          data: assignmentsData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          type: 'bar'
        }
      ]
    };
  };
  
  // Options pour le graphique d'évolution mensuelle
  const monthlyEvolutionOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Évolution mensuelle de la participation',
        font: {
          size: 14
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 10
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Jours',
          font: {
            size: 10
          }
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Heures',
          font: {
            size: 10
          }
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };
  
  // Fonction pour calculer le niveau de compétence basé sur les produits collectés
  const calculateSkillLevel = (productTypes) => {
    let total = 0;
    
    if (stats.productCategories) {
      Object.entries(stats.productCategories).forEach(([product, quantity]) => {
        if (productTypes.some(type => product.toLowerCase().includes(type.toLowerCase()))) {
          total += quantity;
        }
      });
    }
    
    return total * 5; // Facteur arbitraire pour convertir en niveau de compétence
  };
  
  // Options pour le graphique radar
  const radarOptions = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          font: {
            size: 10
          },
          backdropPadding: 3
        },
        pointLabels: {
          font: {
            size: 10
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Niveau de compétence',
        font: {
          size: 14
        },
        padding: {
          top: 10,
          bottom: 10
        }
      }
    }
  };
  
  // Préparer les données pour le graphique à barres des statistiques générales
  const prepareGeneralStatsData = () => {
    return {
      labels: ['Jours de participation', 'Heures de bénévolat', 'Collectes complétées'],
      datasets: [
        {
          label: 'Statistiques',
          data: [
            stats.totalParticipationDays,
            stats.totalHours + (stats.totalMinutes / 60),
            stats.totalCompletedAssignments
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(75, 192, 192)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Options pour le graphique à barres
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Statistiques générales',
        font: {
          size: 14
        },
        padding: {
          top: 10,
          bottom: 10
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };
  
  // Préparer les données pour le graphique en camembert des produits collectés
  const productsData = prepareProductsData();
  
  // Préparer les données pour le graphique radar des compétences
  const skillsData = prepareSkillsData();
  
  // Préparer les données pour le graphique à barres des statistiques générales
  const generalStatsData = prepareGeneralStatsData();
  
  // Préparer les données pour le graphique d'évolution mensuelle
  const monthlyEvolutionData = prepareMonthlyEvolutionData();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Statistiques générales */}
      <div className="bg-white rounded-lg shadow p-4">
        <Bar data={generalStatsData} options={barOptions} />
      </div>
      
      {/* Niveau de compétence */}
      <div className="bg-white rounded-lg shadow p-4">
        <Radar data={skillsData} options={radarOptions} />
      </div>
      
      {/* Évolution mensuelle et Répartition des produits côte à côte */}
      <div className="bg-white rounded-lg shadow p-4 h-80">
        {monthlyEvolutionData ? (
          <Line data={monthlyEvolutionData} options={{
            ...monthlyEvolutionOptions,
            maintainAspectRatio: false
          }} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Données d'évolution non disponibles</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-4 h-80">
        {productsData ? (
          <Pie data={productsData} options={{
            ...pieOptions,
            maintainAspectRatio: false
          }} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Aucun produit collecté</p>
          </div>
        )}
      </div>
      
      {/* Activité récente */}
      {stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Activité récente</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commerçant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits collectés</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.merchant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(activity.duration / 60)}h{activity.duration % 60 > 0 ? ` ${activity.duration % 60}min` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.products.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
