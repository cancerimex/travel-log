const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

require('dotenv').config();
const keys = require("./config");

const middlewares = require('./middlewares');
const logs = require('./api/logs');

const User = require("./models/User");

const app = express();

app.use(passport.initialize());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use(new GitHubStrategy({
  clientID: keys.GITHUB.clientID,
  clientSecret: keys.GITHUB.clientSecret,
  callbackURL: "/auth/github/callback"
},
  function (accessToken, refreshToken, profile, done) {
    User.findOne({ userId: profile.id })
      .then((existingUser) => {
        if (existingUser) {
          done(null, existingUser)
        } else {
          new User({
            userId: profile.id,
            username: profile.username,
            picture: profile.photos[0].value
          }).save()
            .then((user) => {
              done(null, user)
            })
        }
      })
  }
));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(morgan('common'));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!'
  });
});

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  middlewares.generateToken,
  function (req, res) {
    res.redirect(`${process.env.CORS_ORIGIN}/?token=${req.token}`); // App URL
});

app.use('/api/logs', logs);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port} `);
});
