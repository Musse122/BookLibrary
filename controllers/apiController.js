const axios = require("axios");

exports.getBookList = async (req, res) => {
  try {
    const searchTerm = req.query.q ? req.query.q.trim() : ""; // Default to empty string

    if (!searchTerm) {
      return res.render("bookList", { books: [], searchTerm: "", error: "Please enter a search term!" });
    }

    // Fetch books from the API
    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: { q: searchTerm, maxResults: 10 },
    });

    const books = response.data.items || [];
    res.render("bookList", { books, searchTerm, error: null });
  } catch (error) {
    console.error("Error fetching books:", error.message);
    res.render("bookList", { books: [], searchTerm: "", error: "Error fetching books. Please try again." });
  }
};

