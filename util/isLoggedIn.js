module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please sign in or sign up to continue");
    return res.redirect("/users/login");
  }
  next();
};