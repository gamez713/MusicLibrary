const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkNotAuthenticated } = require("../controllers/users-auth");
const { appendFile } = require("fs");

route.get("/", checkNotAuthenticated, async(req, res) => {

try {
  //counts number of playlist from specified user.
  const songs_count = await pool.query("SELECT COUNT(songs.song_name) FROM songs")
  //gets the playlist_names sorted by date created.
  const songs = await pool.query("SELECT DISTINCT s.song_name AS name, s.artist_f_name AS artist, s.artist_l_name AS lname, sl.song_link AS path FROM songs AS s, song_link as sl WHERE s.song_id = sl.song_id")
  
   for(let i=0; i<songs_count.rows[0].count; i++){
       Q = songs.rows[i].artist + " " + songs.rows[i].lname
       songs.rows[i].artist = Q
  }
  
  res.render("musicplayer", {songs: songs.rows, scount: songs_count.rows[0].count});
  } catch (e) {
      console.log(e);
      res.send("There was an error");
  }
});

module.exports = route;