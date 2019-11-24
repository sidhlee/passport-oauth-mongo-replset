const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github").Strategy;

module.exports = (app, db) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    db.collection("socialusers")
      .findOne({ id: id })
      .then(user => {
        done(null, user);
      })
      .catch(err => console.log(err));
  });

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:2000/auth/github/callback"
      },
      (accessToken, refreshToken, profile, done) => {
        db.collection("socialusers")
          .findOneAndUpdate(
            { id: profile.id },
            {
              $setOnInsert: {
                id: profile.id,
                name: profile.displayName || "John Doe",
                photo: profile.photos[0].value || "",
                email: profile.email || "No public email",
                created_on: new Date()
              },
              $set: {
                last_login: new Date()
              },
              $inc: {
                login_count: 1
              }
            },
            { upsert: true, returnOriginal: false }
          )
          .then(user => {
            console.log(user);
            done(null, user.value);
          })
          .catch(err => console.log(err));
      }
    )
  );
};
