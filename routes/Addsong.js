const express = require("express");
const route = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
const { uploadSong } = require("../helpers/UploadFxns");
const { checkAuth } = require("../helpers/userAuth");

// for parsing multipart/form-data
var upload = multer({ dest: './upload'});
var type = upload.single('song_file');
console.log(type);

route.get("/", checkAuth, (req, res) => {
    data = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    res.render("addsong", {role: data});
});

route.post("/uploadsong", type, async (req, res) => {
    let { song_title, song_genre, song_file } = req.body;
    uploadSong(req.file, song_title, song_genre, req.user);
    res.redirect("/dashMusician");
});

module.exports = route;