const express = require("express");
const route = express.Router();
const passport = require("passport");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", (req, res) => {
    res.render("login");
});

// route.post("/", passport.authenticate('local', {
//     successRedirect: "/dashMusician",
//     failureRedirect: "/login",
//     failureFlash: true
// }));

route.post('/', passport.authenticate('local', {
    failureRedirect: '/login'}),
    (req, res) => {
      
      if (req.user.role == "admin") {
        res.redirect('/dashAdmin');
      }
      else if (req.user.role == "musician") {
        res.redirect('/dashMusician');
      }
      else if (req.user.role == "listener") {
        res.redirect('/dashListener');
      }
});

module.exports = route;