const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const profileRoutes = require('./routes/profile');
const newsletterRoutes = require('./routes/newsletter');
app.use('/api/contact', require('./routes/contact'));
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

// Passport Config for social authentication
require('./config/passport')(passport); 

// Routes for the Api
app.use('/api/auth', require('./routes/UserAuth'));
app.use('/api/profile', profileRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', require('./routes/contact'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Hi, Wasem! you are connected to MongoDB Atlas'))
  .catch((err) => console.error('Hi, Wasem! MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hi, Wasem! Server running on port ${PORT}`);
});