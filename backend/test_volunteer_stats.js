const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assignment = require('./src/models/Assignment');
const User = require('./src/models/User');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour calculer les statistiques d'un bénévole
async function calculateVolunteerStats(volunteerId) {
  try {
    // Vérifier si le bénévole existe
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      console.error(`Bénévole non trouvé avec l'id ${volunteerId}`);
      return;
    }

    console.log(`Calcul des statistiques pour le bénévole: ${volunteer.name}`);

    // Récupérer toutes les affectations complétées du bénévole
    const completedAssignments = await Assignment.find({ 
      volunteer: volunteerId,
      status: 'completed',
      startTime: { $ne: null },
      endTime: { $ne: null }
    });

    console.log(`Nombre d'affectations complétées: ${completedAssignments.length}`);

    // Calculer les statistiques
    let totalHours = 0;
    let totalMinutes = 0;
    const participationDays = new Set();

    completedAssignments.forEach(assignment => {
      // Ajouter les minutes de cette affectation
      totalMinutes += assignment.duration || 0;
      
      // Ajouter la date (jour) à l'ensemble des jours de participation
      if (assignment.startTime) {
        const date = new Date(assignment.startTime);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        participationDays.add(dateString);
      }
    });

    // Convertir les minutes en heures
    totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // Statistiques sur les produits collectés
    let totalProducts = 0;
    const productCategories = {};

    completedAssignments.forEach(assignment => {
      if (assignment.collectedItems && assignment.collectedItems.length > 0) {
        assignment.collectedItems.forEach(item => {
          totalProducts += item.quantity || 0;
          
          // Regrouper par catégorie (nom du produit)
          if (!productCategories[item.name]) {
            productCategories[item.name] = 0;
          }
          productCategories[item.name] += item.quantity || 0;
        });
      }
    });

    // Préparer les données de réponse
    const stats = {
      totalParticipationDays: participationDays.size,
      totalHours,
      totalMinutes: remainingMinutes,
      totalDuration: totalMinutes, // Durée totale en minutes
      totalCompletedAssignments: completedAssignments.length,
      totalProducts,
      productCategories
    };

    console.log('Statistiques calculées:');
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Exécuter la fonction avec l'ID du bénévole
const volunteerId = process.argv[2] || '682a40c9e60b69aa313d9694';
calculateVolunteerStats(volunteerId);
