const express = require("express");
const route = express.Router();
const { checkNotAuthenticated } = require("../controllers/users-auth");



route.get("/", checkNotAuthenticated, async (req, res) => {
    res.render("insights");
});


route.post("/", async (req, res) => {
    let { album_from, album_to, genre, rating, playcount_from, playcount_to, user} = req.body;
    
});

route.get("/", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/login");
    });
});

module.exports = route;