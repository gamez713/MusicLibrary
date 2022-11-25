const express = require("express");
const route = express.Router();
const { checkAuth } = require("../helpers/userAuth");
const { pool } = require("../dbConfig");

route.get("/", (req, res) => {
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
    try {
        var data = await pool.query(
        `SELECT song_name, song_genre, artist_f_name, artist_l_name
        FROM songs where songs.song_name
        LIKE '%${search}%'`
        )
        
        console.log(data.rows)
        res.render("browse", {info: data.rows, role: req.user.role});

    } catch (e) {
        console.log(e);
        res.redirect("browse");
    }

});

module.exports = route;