const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", (req, res) => {
    res.render("dashListener");
});

route.get("/", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/login");
    });
});

module.exports = route;