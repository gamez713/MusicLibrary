const express = require("express");
const route = express.Router();
const { checkNotAuthenticated } = require("../controllers/users-auth");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const { uploadSong } = require("../controllers/UploadFxns");
const passport = require("passport");

// for parsing multipart/form-data
var upload = multer({ dest: './upload'});
var type = upload.single('song_file');

route.get("/", checkNotAuthenticated, (req, res) => {
    res.render("addsong");
});

route.post("/uploadsong", type, async (req, res) => {
    let { song_title, song_genre } = req.body;
    uploadSong(req.file, song_title, song_genre, req.user)
    //res.render("dashboard", {user: req.user.fname });
    res.redirect("/dashboard");
});







module.exports = route;