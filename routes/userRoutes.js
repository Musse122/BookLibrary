const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookController = require('../controllers/bookController');
const apiController = require('../controllers/apiController'); // Ensure the correct path

// --- API ROUTES ---
// Attach the getBookList function for /bookList route
router.get('/bookList', apiController.getBookList);

// --- BOOK ROUTES ---

// GET: Book Catalog
router.get('/bookcatalog', bookController.getBookCatalog);

// POST: Issue a Book
router.post('/books/issue/:book_id', bookController.issueBook);

// GET: User's Issued Books
router.get('/myissuedbooks', bookController.getMyIssuedBooks);

// POST: Return a Book
router.post('/return/:issue_id', bookController.returnBook);

// GET: All Issued Books (Admin Only)
router.get('/issuedbooks', bookController.getIssuedBooks);

// GET: Add Book Form
router.get('/addbook', (req, res) => {
  const user = req.session.userId || null;
  const role = req.session.role || null;
  res.render('addbook', { user, role });
});

// POST: Add a Book
router.post('/addbook', bookController.addbook);

// --- USER ROUTES ---

// GET: Registration Form
router.get('/register', (req, res) => {
  res.render('register'); // Render register.ejs view
});

// POST: Handle Registration
router.post('/register', userController.register);

// GET: Login Form
router.get('/login', (req, res) => {
  res.render('login'); // Render login.ejs view
});

// POST: Handle Login
router.post('/login', userController.login);

// GET: Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/users/login');
  });
});

// GET: About Page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Book Library' });
});

module.exports = router; // Export the router for use in app.js
