const express = require("express");
const route = express.Router();
const { checkNotAuthenticated } = require("../controllers/users-auth");

route.get("/", checkNotAuthenticated, (req, res) => {
    res.render("uploadmusic");
});

module.exports = route;