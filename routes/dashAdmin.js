const express = require("express");
const route = express.Router();
const { checkAuth } = require("../helpers/userAuth");

route.get("/", (req, res) => {
    res.render("dashAdmin");
});

module.exports = route;