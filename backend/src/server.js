const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const merchantAuthRoutes = require('./routes/merchantAuthRoutes');
const donationRoutes = require('./routes/donationRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true // Permet l'envoi de cookies avec les requêtes CORS
}));
app.use(express.json());
app.use(cookieParser()); // Pour analyser les cookies

// Protection CSRF désactivée pour le développement
console.log('Protection CSRF désactivée pour le développement');
// Pas de middleware CSRF

// Logger en mode développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route pour obtenir un token CSRF (désactivée)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: 'csrf-disabled' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/merchants/auth', merchantAuthRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/assignments', assignmentRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'API TANY est en ligne' });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs
const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Port et démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
