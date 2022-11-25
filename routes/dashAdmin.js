const express = require("express");
const route = express.Router();
const { pool } = require("../dbConfig");
const { checkAuth } = require("../helpers/userAuth");

route.get("/", checkAuth, (req, res) => {
    let empty = []
    try{
        res.render("dashAdmin", {user: req.user.fname, z: empty});
    } catch (e) {
        console.log(e);
        res.send("There was an error");
    }
});

route.post("/", async (req, res) => {
    let {user_from, user_to, role, rating_from, rating_to, playcount_from, playcount_to } = req.body;
    let empty = []
    data2 = req.user.role.charAt(0).toUpperCase()+ req.user.role.slice(1);

    if(user_from.length == 0)
    {   //If there is no from date, set date to default
        user_from = '1950-01-01'
    }
    if(user_to.length == 0){
        //If there is no to date, set date to default
        var temp_date = new Date();
        user_to = temp_date.getFullYear() + '-' + ('0' + (temp_date.getMonth()+1)).slice(-2) + '-' + ('0' + temp_date.getDate()).slice(-2);
    }
    if(user_from > user_to){
        //If user input from date is larger than to date, we set dates to default.
        user_from = '1950-01-01'
        var temp_date = new Date();
        user_to = temp_date.getFullYear() + '-' + ('0' + (temp_date.getMonth()+1)).slice(-2) + '-' + ('0' + temp_date.getDate()).slice(-2);
    }
    //Input is Any Genre
    if(role == 0){
        role = ' '
    }else{
        role = ` AND users.role='${role}'`
    } 

    //Rating to default max
    if(rating_to.length == 0 || rating_to < 0){
        rating_to = 0
    }
    //Rating from default 0
    if(rating_from.length ==0 || rating_from < 0 || rating_from < rating_to){
        rating_from = 0
    }

    //Checks for values and passes
    if(typeof rating_to !== 'undefined' && typeof rating_from !== 'undefined' && rating_from >= 0 && rating_to > 0){
        rateString = ` AND COUNT(DISTINCT(rating)) between ${rating_from} and ${rating_to}`
    }else{
        rateString = ` AND COUNT(DISTINCT(rating))>=${rating_from}`
    }

    //Playcount to default max
    if(playcount_to.length == 0 || playcount_to < 0){
        playcount_to = 0
    }
    //Playcount from default 0
    if(playcount_from.length ==0 || playcount_from < 0 || playcount_from < playcount_to){
        playcount_from = 0
    }

    //Special when from=0, we include NULl values
    if(playcount_from == 0){
        playString = ` OR SUM(DISTINCT(playcount.count)) IS NULL)`
    }else{
        playString = ")"
    }

    //Checks for values and passes includes NULL string either as ")" or a string
    if(typeof playcount_to !== 'undefined' && typeof playcount_from !== 'undefined' && playcount_from >= 0 && playcount_to > 0){
        playString = ` (SUM(DISTINCT(playcount.count)) between ${playcount_from} and ${playcount_to}` + playString

    }else{
        playString = ` (SUM(DISTINCT(playcount.count))>=${playcount_from}` + playString
    }

    try {
        var word = await pool.query(
            `SELECT users.date_created, users.fname, users.lname, users.email, users.role, SUM(DISTINCT(playcount.count)) as playcount, COUNT(DISTINCT(rating)) as rating
            FROM users
            LEFT JOIN playcount on users.id=playcount.id
            LEFT JOIN rating on users.id=rating.id
            WHERE users.date_created BETWEEN '${user_from}' AND '${user_to}' ${role}
            GROUP by users.date_created, users.fname, users.lname, users.email, users.role
            HAVING ${playString}${rateString}
            ORDER by users.date_created`
            )

        for(let g=0; g<word.rows.length; g++){
            //Used Edd's helpful date slicer code here!!
            date = JSON.stringify(word.rows[g].date_created)
            month = date.slice(6,8)
            day = date.slice(9,11)
            year = date.slice(3,5)
            dateCreated = month + '/' + day + '/' + year
            word.rows[g].date_created = dateCreated
        }
        res.render("dashAdmin", {user: req.user.fname, z: word.rows, role: data2})
    } catch (e) {
        console.log(e);
        res.render("dashAdmin", {user: req.user.fname, z: empty});
    }
});

module.exports = route;