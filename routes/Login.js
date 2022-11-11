const express = require("express");
const route = express.Router();
const passport = require("passport");
const { checkAuthenticated } = require("../controllers/users-auth");

// -------------------- Login --------------------
route.get("/", checkAuthenticated, (req, res) => {
    res.render("login");
});
route.post("/", passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}));

module.exports = route;