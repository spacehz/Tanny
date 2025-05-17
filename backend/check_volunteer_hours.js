const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkVolunteerHours() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Récupérer tous les bénévoles
    const volunteers = await User.find({ role: 'bénévole' });
    
    console.log(`Nombre de bénévoles trouvés: ${volunteers.length}`);
    
    // Afficher les détails de chaque bénévole
    volunteers.forEach((volunteer, index) => {
      console.log(`\nBénévole #${index + 1}:`);
      console.log(`ID: ${volunteer._id}`);
      console.log(`Nom: ${volunteer.name}`);
      console.log(`Email: ${volunteer.email}`);
      console.log(`Disponibilité: ${volunteer.availability || 'Non définie'}`);
      console.log(`Heures bénévolat: ${volunteer.volunteerHours !== undefined ? volunteer.volunteerHours : 'Non défini'}`);
      console.log(`Période d'absence: ${
        volunteer.absencePeriod && volunteer.absencePeriod.startDate && volunteer.absencePeriod.endDate ? 
        `${new Date(volunteer.absencePeriod.startDate).toLocaleDateString('fr-FR')} - ${new Date(volunteer.absencePeriod.endDate).toLocaleDateString('fr-FR')}` : 
        'Non définie'
      }`);
    });
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnexion fermée');
  }
}

checkVolunteerHours();
