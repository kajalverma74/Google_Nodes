


const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const express = require('express');
const User = require('../models/usermodel'); 
require('dotenv').config();

const router = express.Router();


passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
      scope: ['user:email'], 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          console.log('User already exists:', user);
          return done(null, user);
        } else {
          user = new User({
            githubId: profile.id,
            username: profile.username,
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



// Route to start GitHub authentication
router.get('/', (req, res, next) => {
  console.log('Initiating GitHub authentication...');
  passport.authenticate('github')(req, res, next);
});



// Callback route for GitHub to redirect to
router.get(
  '/callback',
  passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
  (req, res) => {
    console.log('User logged in successfully:', req.user);
    res.redirect('/auth/github/success');
  }
);



router.get('/success', (req, res) => {
  if (req.isAuthenticated()) {
    req.session.successMessage = 'User logged in successfully!';
    res.render('success', { user: req.user });
  } else {
    res.redirect('/auth/github/error');
  }
});



router.get('/error', (req, res) => {
  console.log('Error logging in via GitHub.');
  res.send('Error logging in via GitHub.');
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
      
      res.redirect('/');
    });
  });
});



module.exports = router;

