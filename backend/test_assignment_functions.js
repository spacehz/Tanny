const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assignment = require('./src/models/Assignment');
const User = require('./src/models/User');
const Merchant = require('./src/models/Merchant');
const Event = require('./src/models/Event');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour démarrer une affectation
async function startAssignment(assignmentId) {
  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.error(`Affectation non trouvée avec l'id ${assignmentId}`);
      return;
    }

    // Enregistrer l'heure de début
    assignment.startTime = new Date();
    assignment.status = 'in_progress';
    
    // Initialiser collectedItems avec les items prévus
    if (!assignment.collectedItems || assignment.collectedItems.length === 0) {
      assignment.collectedItems = assignment.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        validated: false
      }));
    }
    
    await assignment.save();
    console.log('Affectation démarrée avec succès:', assignment);
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'affectation:', error);
  }
}

// Fonction pour terminer une affectation
async function endAssignment(assignmentId) {
  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.error(`Affectation non trouvée avec l'id ${assignmentId}`);
      return;
    }

    // Vérifier que l'affectation a été démarrée
    if (!assignment.startTime) {
      console.error(`Cette affectation n'a pas encore été démarrée`);
      return;
    }

    // Vérifier que l'affectation n'est pas déjà terminée
    if (assignment.status === 'completed') {
      console.error(`Cette affectation est déjà terminée`);
      return;
    }

    // Enregistrer l'heure de fin
    assignment.endTime = new Date();
    
    // Calculer la durée en minutes
    const startTime = new Date(assignment.startTime);
    const endTime = new Date(assignment.endTime);
    const durationMs = endTime - startTime;
    assignment.duration = Math.round(durationMs / (1000 * 60)); // Conversion en minutes
    
    // Mettre à jour le statut
    assignment.status = 'completed';
    
    await assignment.save();
    console.log('Affectation terminée avec succès:', assignment);

    // Mettre à jour les heures de bénévolat de l'utilisateur
    const volunteer = await User.findById(assignment.volunteer);
    if (volunteer) {
      volunteer.volunteerHours += assignment.duration / 60; // Convertir en heures
      await volunteer.save();
      console.log('Heures de bénévolat mises à jour pour', volunteer.name);
    }
  } catch (error) {
    console.error('Erreur lors de la fin de l\'affectation:', error);
  }
}

// Fonction pour lister toutes les affectations
async function listAssignments() {
  try {
    const assignments = await Assignment.find();
    console.log('Liste des affectations:');
    assignments.forEach(assignment => {
      console.log(`ID: ${assignment._id}, Statut: ${assignment.status}, Bénévole ID: ${assignment.volunteer}`);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
  }
}

// Exécuter les fonctions selon les arguments
const args = process.argv.slice(2);
const command = args[0];
const assignmentId = args[1];

if (command === 'list') {
  listAssignments().then(() => mongoose.disconnect());
} else if (command === 'start' && assignmentId) {
  startAssignment(assignmentId).then(() => mongoose.disconnect());
} else if (command === 'end' && assignmentId) {
  endAssignment(assignmentId).then(() => mongoose.disconnect());
} else {
  console.log('Usage: node test_assignment_functions.js [list|start|end] [assignmentId]');
  mongoose.disconnect();
}
