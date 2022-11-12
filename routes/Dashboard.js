const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkNotAuthenticated } = require("../controllers/users-auth");
route.get("/", checkNotAuthenticated, async (req, res) => {
    try {
        const dict = {}
        //counts number of playlist from specified user.
        const playlist_count = await pool.query("SELECT COUNT(playlist.playlist_name) FROM playlist WHERE id =" + x)
        //gets the playlist_names sorted by date created.
        const playlist_names = await pool.query ("SELECT playlist.playlist_name FROM playlist WHERE id =" + x + "ORDER BY date_created")
    
        for (let b = 0; b < playlist_count.rows[0].count; b++) {
            //Song count of a playlist
            const songs_count = await pool.query("SELECT COUNT(songs.song_name) FROM playlist, playlist_songs, songs WHERE id ="+ x + "AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name ="+ "'"+ playlist_names.rows[b].playlist_name + "'" )
            //Get the songs from each playlist
            //const songs = await pool.query("SELECT songs.song_name, song_link.song_link FROM playlist, playlist_songs, songs WHERE id ="+ x + "AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id AND playlist_name =" + "'" + playlist_names.rows[b].playlist_name + "'" )
            const songs = await pool.query("SELECT songs.song_name, song_link.song_link FROM playlist, playlist_songs, songs, song_link WHERE id ="+ x + "AND playlist.playlist_id = playlist_songs.playlist_id AND songs.song_id = playlist_songs.song_id  AND songs.song_id = song_link.song_id AND playlist_name =" + "'" + playlist_names.rows[b].playlist_name + "'" )

            dict[b] = [];
            for (let g = 0; g < songs_count.rows[0].count; g++){
                dict[b].push(songs.rows[g].song_link)
                dict[b].push(songs.rows[g].song_name)
            }
        }
        console.log(playlist_names.rows)
        
        res.render("dashboard", {user: req.user.fname, test: dict, playlist: playlist_names.rows, pcount: playlist_count.rows[0].count});
        } catch (e) {
            console.log("There was an error");
            res.send("There was an error");
        }
});

route.get("/", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success_msg", "Successfully logged out");
      res.redirect("/login");
    });
});

module.exports = route;