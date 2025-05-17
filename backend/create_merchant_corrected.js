const mongoose = require('mongoose');
const Merchant = require('./src/models/Merchant');

async function createMerchant() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Paramètres du commerçant (avec valeurs par défaut)
    const businessName = process.argv[2] || 'Commerce Test';
    const firstName = process.argv[3] || 'Jean';
    const lastName = process.argv[4] || 'Dupont';
    const email = process.argv[5] || 'commerce@tany.org';
    const phoneNumber = process.argv[6] || '0123456789';
    const siret = process.argv[7] || '12345678901234';
    const street = process.argv[8] || 'Rue du Commerce';
    const city = process.argv[9] || 'Paris';
    const postalCode = process.argv[10] || '75001';
    const country = process.argv[11] || 'France';
    const isActive = process.argv[12] !== 'false'; // Par défaut true, sauf si explicitement 'false'
    
    // Vérifier si le commerçant existe déjà (par email ou siret)
    const merchantExists = await Merchant.findOne({
      $or: [
        { email },
        { siret }
      ]
    });
    
    if (merchantExists) {
      console.log('Un commerçant avec cet email ou ce SIRET existe déjà');
      console.log('Détails du commerçant existant:');
      console.log(`ID: ${merchantExists._id}`);
      console.log(`Commerce: ${merchantExists.businessName}`);
      console.log(`Représentant: ${merchantExists.legalRepresentative.firstName} ${merchantExists.legalRepresentative.lastName}`);
      console.log(`Email: ${merchantExists.email}`);
      console.log(`SIRET: ${merchantExists.siret}`);
      console.log(`Téléphone: ${merchantExists.phoneNumber}`);
      console.log(`Adresse: ${merchantExists.address.street}, ${merchantExists.address.postalCode} ${merchantExists.address.city}, ${merchantExists.address.country}`);
      console.log(`Statut: ${merchantExists.isActive ? 'Actif' : 'Inactif'}`);
    } else {
      // Créer le commerçant
      const merchant = new Merchant({
        businessName,
        legalRepresentative: {
          firstName,
          lastName
        },
        email,
        phoneNumber,
        siret,
        isActive,
        address: {
          street,
          city,
          postalCode,
          country
        }
      });
      
      await merchant.save();
      console.log('Commerçant créé avec succès:');
      console.log(`ID: ${merchant._id}`);
      console.log(`Commerce: ${merchant.businessName}`);
      console.log(`Représentant: ${merchant.legalRepresentative.firstName} ${merchant.legalRepresentative.lastName}`);
      console.log(`Email: ${merchant.email}`);
      console.log(`SIRET: ${merchant.siret}`);
      console.log(`Téléphone: ${merchant.phoneNumber}`);
      console.log(`Adresse: ${merchant.address.street}, ${merchant.address.postalCode} ${merchant.address.city}, ${merchant.address.country}`);
      console.log(`Statut: ${merchant.isActive ? 'Actif' : 'Inactif'}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

// Afficher les instructions d'utilisation
if (process.argv.length === 2) {
  console.log('Utilisation: node create_merchant_corrected.js [nom_commerce] [prenom_representant] [nom_representant] [email] [telephone] [siret] [rue] [ville] [code_postal] [pays] [actif]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Nom du commerce: Commerce Test');
  console.log('Représentant: Jean Dupont');
  console.log('Email: commerce@tany.org');
  console.log('Téléphone: 0123456789');
  console.log('SIRET: 12345678901234');
  console.log('Adresse: Rue du Commerce, 75001 Paris, France');
  console.log('Statut: Actif (utilisez "false" pour inactif)');
}

createMerchant();
