const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

// Import Routes
const profileRoutes = require('./routes/profile');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/UserAuth');

const app = express();

// 1. Middleware (Must come before routes)
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// 2. Passport Config
require('./config/passport')(passport); 

// 3. Routes for the Api
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Hi, Wasem! you are connected to MongoDB Atlas'))
  .catch((err) => console.error('Hi, Wasem! MongoDB Connection Error:', err));

// 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hi, Wasem! Server running on port ${PORT}`);
});