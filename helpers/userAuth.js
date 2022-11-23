// Func to check if user is logged in
function checkAuth(req, res, next) {
    if (req.user == null) {
      return res.redirect("/login");
    }
    next();
};
// Func to check if user is NOT logged in
// function checkNotAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//       return next();
//     }
//     // Not logged in
//     res.redirect("/login");
// };

module.exports = { checkAuth }