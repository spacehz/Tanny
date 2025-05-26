require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Script pour s'assurer que tous les fichiers qui utilisent eventStatusService
 * importent également les modèles User et Merchant
 */
const ensureModelsLoaded = async () => {
  try {
    console.log('Vérification des imports dans les fichiers utilisant eventStatusService...');

    // Liste des fichiers à vérifier
    const filesToCheck = [
      './src/cron/eventStatusCron.js',
      './src/controllers/eventController.js'
    ];

    for (const filePath of filesToCheck) {
      console.log(`\nTraitement du fichier ${filePath}...`);
      
      // Lire le contenu du fichier
      const content = await readFileAsync(filePath, 'utf8');
      
      // Vérifier si le fichier utilise eventStatusService
      if (content.includes('eventStatusService')) {
        console.log('Le fichier utilise eventStatusService');
        
        // Vérifier si les modèles sont déjà importés
        const hasUserImport = content.includes("require('../models/User')");
        const hasMerchantImport = content.includes("require('../models/Merchant')");
        
        if (!hasUserImport || !hasMerchantImport) {
          console.log('Ajout des imports manquants...');
          
          // Trouver la position pour insérer les imports
          let newContent = content;
          
          // Chercher la dernière ligne d'import
          const lines = content.split('\n');
          let lastImportLine = 0;
          
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('require(') || lines[i].includes('import ')) {
              lastImportLine = i;
            }
          }
          
          // Préparer les imports à ajouter
          const importsToAdd = [];
          if (!hasUserImport) {
            importsToAdd.push("const User = require('../models/User');");
          }
          if (!hasMerchantImport) {
            importsToAdd.push("const Merchant = require('../models/Merchant');");
          }
          
          // Insérer les imports après la dernière ligne d'import
          if (importsToAdd.length > 0) {
            lines.splice(lastImportLine + 1, 0, ...importsToAdd);
            newContent = lines.join('\n');
            
            // Écrire le contenu mis à jour dans le fichier
            await writeFileAsync(filePath, newContent, 'utf8');
            console.log('Imports ajoutés avec succès');
          } else {
            console.log('Aucun import à ajouter');
          }
        } else {
          console.log('Tous les imports nécessaires sont déjà présents');
        }
      } else {
        console.log('Le fichier n\'utilise pas eventStatusService, ignoré');
      }
    }

    console.log('\nVérification terminée');
  } catch (error) {
    console.error('Erreur lors de la vérification des imports:', error);
  }
};

// Exécuter le script
ensureModelsLoaded();
