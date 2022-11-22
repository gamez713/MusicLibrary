const express = require("express");
const route = express.Router();
const passport = require("passport");
const { checkAuthenticated } = require("../controllers/users-auth");

route.get("/", (req, res) => {
    res.render("login");
});

route.post("/", passport.authenticate('local', {
    successRedirect: "/dashMusician",
    failureRedirect: "/login",
    failureFlash: true
}));

module.exports = route;