const express = require("express");
const route = express.Router();
const { checkAuth } = require("../helpers/userAuth");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const { uploadSong } = require("../helpers/UploadFxns");

// for parsing multipart/form-data
var upload = multer({ dest: './upload'});
var type = upload.single('song_file');
console.log(type);

route.get("/", (req, res) => {
    res.render("addsong");
});

route.post("/uploadsong", type, async (req, res) => {
    let { song_title, song_genre, song_file } = req.body;
    console.log(req.body);
    uploadSong(req.file, song_title, song_genre, req.user);
    res.redirect("/dashboard");
});

module.exports = route;