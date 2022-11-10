// Func to check if user is logged in
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/dashboard");
    }
    next();
};
// Func to check if user is NOT logged in
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // Not logged in
    res.redirect("/users/login");
};

module.exports = { checkAuthenticated, checkNotAuthenticated }