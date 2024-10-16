const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy; 
const express = require('express');
const User = require('../models/usermodel'); 
require('dotenv').config();

const router = express.Router();

// Passport Google Strategy setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('User already exists:', user);
          return done(null, user);
        } else {
          user = new User({
            googleId: profile.id,
            username: profile.displayName,
            thumbnail: profile._json.picture,
            email: email,
          });

          await user.save();
          console.log('New user created:', user);
          return done(null, user);
        }
      } catch (error) {
        console.error('Error during user creation:', error);
        return done(error, null);
      }
    }
  )
);


passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          console.log('User already exists:', user);
          return done(null, user);
        } else {
          user = new User({
            facebookId: profile.id,
            username: profile.displayName,
            thumbnail: profile.photos[0].value,
            email: email,
          });

          await user.save();
          console.log('New user created:', user);
          return done(null, user);
        }
      } catch (error) {
        console.error('Error during user creation:', error);
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

router.get('/google', (req, res, next) => {
  console.log('Initiating Google authentication...');
  passport.authenticate('google')(req, res, next);
});


router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
  (req, res) => {
    console.log('User logged in successfully:', req.user);
    res.redirect('/auth/google/success');
  }
);


router.get('/facebook', (req, res, next) => {
  console.log('Initiating Facebook authentication...');
  passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});


router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook/error' }),
  (req, res) => {
    console.log('User logged in successfully:', req.user);
    res.redirect('/auth/facebook/success');
  }
);


router.get('/google/success', (req, res) => {
  if (req.isAuthenticated()) {
    req.session.successMessage = 'User logged in successfully!';
    res.render('success', { user: req.user });
  } else {
    res.redirect('/auth/google/error');
  }
});

router.get('/facebook/success', (req, res) => {
  if (req.isAuthenticated()) {
    req.session.successMessage = 'User logged in successfully!';
    res.render('success', { user: req.user });
  } else {
    res.redirect('/auth/facebook/error');
  }
});


router.get('/google/error', (req, res) => {
  console.log('Error logging in via Google.');
  res.send('Error logging in via Google.');
});

router.get('/facebook/error', (req, res) => {
  console.log('Error logging in via Facebook.');
  res.send('Error logging in via Facebook.');
});


router.get('/signout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return next(err);
      }
      
      const googleLogoutURL = 'https://accounts.google.com/Logout';
      res.redirect(googleLogoutURL);  
    });
  });
});

module.exports = router;
