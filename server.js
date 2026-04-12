const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const profileRoutes = require('./routes/profile');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/UserAuth');

const app = express();


app.set('trust proxy', 1);

// Middleware
app.use(express.json());

// REFINED CORS CONFIGURATION
const allowedOrigins = [
  "https://www.inanst.com",
  "https://inanst.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin 
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Root Health Check
app.get('/', (req, res) => {
  res.send('Inanst API is running smoothly.');
});


app.use((err, req, res, next) => {
  console.error('Hi, Wasem! Global Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Hi, Wasem! you are connected to MongoDB Atlas'))
  .catch((err) => console.error('Hi, Wasem! MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
  console.log(`Hi, Wasem! Server running on port ${PORT}`);
});