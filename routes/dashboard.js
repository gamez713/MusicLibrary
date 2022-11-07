const express = require("express");
const route = express();
const { pool } = require("../dbConfig");
const passport = require("passport");
const { checkNotAuthenticated } = require("../basicAuth");


route.get("/uploadmusic", checkNotAuthenticated, (req, res) => {
    res.render("uploadmusic", {user: req.user.name });
});

route.get("/browse", checkNotAuthenticated, (req, res) => {
    res.render("browse", {user: req.user.name });
});

module.exports = route;