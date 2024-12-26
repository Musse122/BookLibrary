const db = require('../models/db'); // Import the database connection


exports.addbook = (req, res) => {
  // Get data from the form
  const { title, author, genre, published_year, isbn, copies_available } =
    req.body;

  // Prepare the SQL query to insert the new book
  const query = `INSERT INTO book (title, author, genre, published_year, isbn, copies_available) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

  // Execute the query with the values from the form
  db.execute(
    query,
    [title, author, genre, published_year, isbn, copies_available],
    (err, result) => {
      if (err) {

        console.error("Error inserting book:", err);
        return res.redirect('/users/addbook')
      }

      // On success, redirect to the books list or another page
      req.flash("success_msg", "book added successfully");
      res.redirect("/users/books"); // Change this to your desired redirect route
    }
  );
};

exports.getBooks = (req, res) => {
  const query = "SELECT * FROM book";

  db.execute(query, (err, results) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).send("Failed to fetch books.");
    }
     const user = req.session.userId;
     const role = req.session.role;
    // Render the books list page and pass the books data
    res.render("books", { books: results,user,role});
  });
};



exports.getIssuedBooks = (req, res) => {
  const query = `
    SELECT 
      issued_books.book_id,
      issued_books.user_id,
      user.name,
      issued_books.issued_date
    FROM issued_books
    JOIN user ON issued_books.user_id = user.user_id;
  `;

  db.execute(query, (err, results) => {
    if (err) {
      console.error("Error fetching issued books:", err);
      return res.status(500).send("Failed to retrieve issued books.");
    }
    const user = req.session.userId;
    const role = req.session.role;

    // Render the 'issuedBooks.ejs' file with the data
    res.render("issuedBooks", { issuedBooks: results,role,user });
  });
};


///for users

exports.getBookCatalog = (req, res) => {
  const query = "SELECT * FROM book";

  db.execute(query, (err, results) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).send("Failed to fetch books.");
    }
    const user = req.session.userId;
    const role = req.session.role;
    // Render the books list page and pass the books data
    res.render("bookcatalog", { books: results, user, role });
  });
};

// for issue book
exports.issueBook = (req, res) => {
  const bookId = req.params.book_id; // Get the book id from the URL parameter
  const userId = req.session.userId; // Assuming the user ID is stored in the session (ensure you're using sessions)
  const currentDate = new Date().toISOString().split("T")[0]; // Get today's date (YYYY-MM-DD format)
  

  // First, update the book's copies_available
  const updateQuery =
    "UPDATE book SET copies_available = copies_available - 1 WHERE book_id = ? AND copies_available > 0";

  db.execute(updateQuery, [bookId], (err, results) => {
    if (err) {
      console.error("Error updating book:", err);
      return res.status(500).send("Failed to issue book.");
    }

    // If no rows were affected, it means there are no available copies
    if (results.affectedRows === 0) {
      return res.status(400).send("No copies available for this book.");
    }

    // Insert the issued book into the issue_books table
    const insertQuery =
      "INSERT INTO issued_books ( book_id, user_id, issued_date) VALUES (?, ?, ?)";

    db.execute(
      insertQuery,
      [bookId, userId, currentDate],
      (err, insertResults) => {
        if (err) {
          console.error("Error inserting into issue_books:", err);
          return res.status(500).send("Failed to log issued book.");
        }
        
        const user = req.session.userId;
        const role = req.session.role;
        // Render the books list page and pass the books data
        return res.redirect("/users/bookcatalog");
      }
    );
  });
};

// Function to display the list of issued books for a user
exports.getMyIssuedBooks = (req, res) => {
  const userId = req.session.userId; // Assuming userId is stored in the session

  // Query to get the issued books details
  const query = `
    SELECT ib.issue_id, b.title, b.author, b.published_year, ib.issued_date, b.book_id
    FROM issued_books ib
    JOIN book b ON ib.book_id = b.book_id
    WHERE ib.user_id = ?
  `;

  db.execute(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching issued books:", err);
      return res.status(500).send("Failed to fetch issued books.");
    }
    const user = req.session.userId;
    const role = req.session.role;
    console.log(results)
    // Render the 'issuedBooks' page and pass the fetched books data
    res.render("myissuedbooks", { books: results, user, role });
  });
};

exports.returnBook = (req, res) => {
  const issueId = req.params.issue_id; // Use issue_id from request parameters

  // Query to get the book_id based on issue_id
  const getBookIdQuery = "SELECT book_id FROM issued_books WHERE issue_id = ?";

  db.execute(getBookIdQuery, [issueId], (err, results) => {
    if (err) {
      console.error("Error fetching book ID:", err);
      return res.status(500).send("Failed to fetch book information.");
    }

    if (results.length === 0) {
      return res.status(404).send("Issued book record not found.");
    }

    const bookId = results[0].book_id;

    // Update book's available copies
    const updateBookQuery =
      "UPDATE book SET copies_available = copies_available + 1 WHERE book_id = ?";

    db.execute(updateBookQuery, [bookId], (err) => {
      if (err) {
        console.error("Error updating book copies:", err);
        return res.status(500).send("Failed to update book availability.");
      }

      // Remove the issued book entry from the 'issued_books' table
      const deleteIssuedBookQuery =
        "DELETE FROM issued_books WHERE issue_id = ?";

      db.execute(deleteIssuedBookQuery, [issueId], (err) => {
        if (err) {
          console.error("Error removing issued book record:", err);
          return res.status(500).send("Failed to delete issued book record.");
        }

        // On success, redirect to the issued books list
        req.flash("success_msg", "Book returned successfully.");
        res.redirect("/users/myissuedbooks"); // Redirect to issued books page
      });
    });
  });
};



