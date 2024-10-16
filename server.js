const express = require('express');

const app = express();

const db = require('./db');

const session = require('express-session');

const googleAuthRoutes = require('./controllers/google');

const facebookRouter = require('./controllers/facebook');

const githubRouter = require('./controllers/github');

const protectedRouter = require('./controllers/protected-route');

const passport = require('passport');

const path = require('path');

const User = require('./models/usermodel'); 

require('dotenv').config();


// Set the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Session middleware
const MongoStore = require('connect-mongo');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Passport serialization
passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email }); 
});


// Passport deserialization
passport.deserializeUser(async (sessionData, done) => {
  try {
    const user = await User.findById(sessionData.id); // Fetch user by ID
    done(null, user); // Pass the user to req.user
  } catch (error) {
    done(error, null); // Handle error
  }
});


// Routes
app.get('/', (req, res) => {
  res.render('auth');
});

app.use('/auth/google', googleAuthRoutes);

app.use('/auth', facebookRouter);

app.use('/auth/github', githubRouter);

app.use('/protected', protectedRouter);




// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port));



