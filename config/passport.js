const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      isVerified: true // Social accounts 
    }
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) { done(null, user); } 
      else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (err) { console.error(err); }
  }));
};