const bcrypt = require("bcryptjs");
const db = require("../models/db"); // Import the database connection
const saltRounds = 10;

// Export login function
exports.login = (req, res) => {
  const { email, password } = req.body;

  // SQL query to check if the user exists in the database
  const query = "SELECT * FROM User WHERE email = ?";

  // Execute query to fetch user based on email
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal Server Error");
    }

    // If no user found
    if (results.length === 0) {
      req.flash("error_msg", "Invalid email or password");
      return res.redirect("/users/login"); // Redirect back to the login page
    }

    const user = results[0]; // Get the user data from the results

    // Compare the entered password with the hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).send("Error processing login");
      }

      if (isMatch) {
        // Store user info in session
        req.session.userId = user.user_id; // Store the user ID in the session
        req.session.userName = user.name;
        req.session.role = user.role;

        req.flash("success_msg", "Login successful");
        return res.redirect("/"); // Redirect to the home page
      } else {
        req.flash("error_msg", "Invalid email or password");
        return res.redirect("/users/login");
      }
    });
  });
};

// Export register function
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  // Check if any field is missing
  if (!name || !email || !password) {
    return res.status(400).send({ error: "Please provide all fields" });
  }

  // Check if the email already exists
  db.execute("SELECT * FROM User WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send({ error: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).send({ error: "Email already in use" });
    }

    // Hash the password before inserting into the database
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send({ error: "Error hashing password" });
      }

      // Insert the new user into the database with the hashed password
      const query = "INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)";
      db.execute(query, [name, email, hashedPassword, "user"], (err, results) => {
        if (err) {
          console.error("Error inserting user:", err);
          return res.status(500).send({ error: "Error registering user" });
        }

        req.flash("success_msg", "Registration successful! Please login.");
        return res.redirect("/users/login");
      });
    });
  });
};
