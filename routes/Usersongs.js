var express = require('express');
var route = express.Router();
const { pool } = require("../dbConfig");
const { checkNotAuthenticated } = require("../controllers/users-auth");


// another routes also appear here
// this script to fetch data from MySQL databse table
route.get('/', function(req, res, next) {
    
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
    res.render('usersongs', { userData: data});
  });
});

route.get("/", checkNotAuthenticated, (req, res) => {
    res.render("usersongs");
});




module.exports = route;