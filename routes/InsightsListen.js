const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, async (req, res) => {
    let empty = []
    data = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    try{
        res.render("insightslisten", {z: empty, role: data});
    } catch (e) {
        console.log(e);
        res.send("There was an error");
    }
});

route.post("/listenerReport", async (req, res) => {
    let { artist_fname, artist_lname, genre} = req.body;
    let user_id = req.user.id;
    let userRecords = await get_user_records(user_id, artist_fname, artist_lname, genre);
    res.render("insightslisten", {z: userRecords, role: data});
});

async function get_user_records(user_id, artist_fname, artist_lname, genre){
   const res = await pool.query(
        `SELECT s.song_id, s.artist_f_name, s.artist_l_name, s.song_name, s.song_genre, p.count FROM playcount p
        JOIN songs s ON p.song_id = s.song_id
        WHERE p.id =$1
        ORDER BY p.count DESC;`, 
        [user_id]);
    return filter(res.rows, artist_fname, artist_lname, genre);
}

function filter(results, artist_fname, artist_lname, genre){
    artist_fname = artist_fname.toLowerCase();
    artist_lname = artist_lname.toLowerCase();
    let output = [];
    for (var result of results){
        if(artist_fname != result.artist_f_name.toLowerCase() && artist_fname != ''){
            continue;
        }
        if(artist_lname != result.artist_l_name.toLowerCase() && artist_lname != ''){
            continue;
        }
        if(genre != result.song_genre && genre != '0'){
            continue;
        }
        output.push(result);
    }
    return output;
}
module.exports = route;