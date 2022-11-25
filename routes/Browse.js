const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, (req, res) => {
    let empty = []
    try{
        res.render("browse", {info: empty});
    } catch (e) {
        console.log(e);
        res.send("There was an error");
    }
});

route.post("/", async (req, res) => {
    let { search } = req.body;
    try {
        var data = await pool.query(
        `SELECT song_name, song_genre, artist_f_name, artist_l_name
        FROM songs where songs.song_name
        LIKE '%${search}%'`
        )
        
        console.log(data.rows)
        res.render("browse", {info: data.rows});

    } catch (e) {
        console.log(e);
        res.redirect("browse");
    }

});

module.exports = route;