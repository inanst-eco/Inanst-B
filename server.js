const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const profileRoutes = require('./routes/profile');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/UserAuth');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const comments = require('./routes/comments');
const adminRoutes = require('./routes/adminRoutes');

// Import the Webhook Controller specifically
const enrollmentWebhook = require('./controllers/enrollmentWebhook');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Essential for deployments like Render/Heroku
app.set('trust proxy', 1);



app.use(express.json());

// REFINED CORS CONFIGURATION
const allowedOrigins = [
  "https://www.inanst.com",
  "https://inanst.com",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 
}));


app.post('/webhook', enrollmentWebhook.handlePaystackWebhook);

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api', profileRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/comments', comments);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/admin', adminRoutes);




// Root Health Check
app.get('/', (req, res) => {
  res.send('Inanst API is running smoothly.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Hi, Wasem! Global Error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Hi, Wasem! You are connected to MongoDB Atlas'))
  .catch((err) => console.error('Hi, Wasem! MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 10000; 
app.listen(PORT, () => {
  console.log(`Hi, Wasem! Server running on port ${PORT}`);
});