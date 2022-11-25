var express = require('express');
var route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

// another routes also appear here
// this script to fetch data from MySQL databse table
route.get('/', checkAuth, function(req, res, next) {
    data2 = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);
    
    const user_id = req.user.id;
    pool.query(`SELECT songs.song_name, songs.song_genre, songs.song_time, songs.artist_f_name, songs.artist_l_name, songbelong.id FROM songbelong
    INNER JOIN songs
    ON songs.song_id = songbelong.song_id
    WHERE songbelong.id = $1`, [user_id],
         (err, data) =>{
            if (err) {
                throw err;
            }
            console.log(req.user);
    res.render('usersongs', { userData: data, role : data2});
  });
});

route.get("/", (req, res) => {
    res.render("usersongs");
});




module.exports = route;