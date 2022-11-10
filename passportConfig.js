const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  const authenticateUser = (email, password, done) => {

    // Checks if email and password exists in DB
    pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);
        // Found user
        if (results.rows.length > 0) {
          const user = results.rows[0];

          // Comparing input password to DB password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              // Incorrect password
              return done(null, false, { message: "Incorrect password" });
            }
          });
        } else {
          // No user found
          return done(null, false, {
            message: "No user exists with the given email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );

  // Stores user id in session
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM users WHERE id = $1`, x=[id], (err, results) => {
      if (err) {
        return done(err);
      }
      return done(null, results.rows[0]);
    });
  });
}
module.exports = initialize;