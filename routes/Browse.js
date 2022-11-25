const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, (req, res) => {
    let empty = []
    data = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    try{
        res.render("browse", {info: empty, role: data});
    } catch (e) {
        console.log(e);
        res.send("There was an error");
    }
});

route.post("/", async (req, res) => {
    let { search } = req.body;
    data2 = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    try {
        var data = await pool.query(
        `SELECT song_name, song_genre, artist_f_name, artist_l_name
        FROM songs
        WHERE songs.song_name LIKE '%${search}%' OR songs.song_genre LIKE '%${search}%' OR songs.artist_f_name LIKE '%${search}%' OR songs.artist_l_name LIKE '%${search}%' `
        )
        
        console.log(data.rows)
        res.render("browse", {info: data.rows, role: data2});

    } catch (e) {
        console.log(e);
        res.redirect("browse");
    }

});

module.exports = route;