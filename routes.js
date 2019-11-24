const passport = require("passport");

module.exports = function(app, db) {
  app.route("/").get((req, res) => {
    res.render(process.cwd() + "/views/pug/");
  });

  app.route("/auth/github").get(passport.authenticate("github"));

  app
    .route("/auth/github/callback")
    .get(
      passport.authenticate("github", { failureRedirect: "/" }),
      (req, res) => {
        res.redirect("/profile");
      }
    );

  app.route("/profile").get(ensureAuthenticated, (req, res) => {
    console.log("Authentication ensured");
    console.log("req.user: ", req.user);
    res.render(process.cwd() + "/views/pug/profile", {
      user: req.user
    });
  });

  function ensureAuthenticated(req, res, next) {
    return req.isAuthenticated() ? next() : res.redirect("/");
  }

  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.use((req, res, next) => {
    res
      .status(400)
      .type("text")
      .send("400 Not Found");
  });
};
