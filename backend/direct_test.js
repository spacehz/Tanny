const mongoose = require('mongoose');
const Assignment = require('./src/models/Assignment');
const User = require('./src/models/User');

// Connexion à la base de données
mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour mettre à jour directement une affectation
async function updateAssignment(assignmentId, status) {
  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.error(`Affectation non trouvée avec l'id ${assignmentId}`);
      return;
    }
    
    if (status === 'start') {
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
    } else if (status === 'end') {
      if (!assignment.startTime) {
        console.error(`Cette affectation n'a pas encore été démarrée`);
        return;
      }
      
      assignment.endTime = new Date();
      
      // Calculer la durée en minutes
      const startTime = new Date(assignment.startTime);
      const endTime = new Date(assignment.endTime);
      const durationMs = endTime - startTime;
      assignment.duration = Math.round(durationMs / (1000 * 60)); // Conversion en minutes
      
      assignment.status = 'completed';
      
      // Mettre à jour les heures de bénévolat de l'utilisateur
      const volunteer = await User.findById(assignment.volunteer);
      if (volunteer) {
        volunteer.volunteerHours += assignment.duration / 60; // Convertir en heures
        await volunteer.save();
        console.log('Heures de bénévolat mises à jour pour', volunteer.name);
      }
    }
    
    await assignment.save();
    console.log(`Affectation mise à jour avec succès: ${assignment._id}, statut: ${assignment.status}`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'affectation:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Exécuter la fonction selon les arguments
const args = process.argv.slice(2);
const assignmentId = args[0];
const status = args[1]; // 'start' ou 'end'

if (assignmentId && status) {
  updateAssignment(assignmentId, status);
} else {
  console.log('Usage: node direct_test.js [assignmentId] [start|end]');
  mongoose.disconnect();
}
