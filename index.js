const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
const dbPath = path.join(__dirname, 'goodreads.db');

const PORT = process.env.PORT || 3000;

let db = null;



// Initialize Database and Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Insert 5 books after DB connection is established
    await insertBooks();

    app.listen(PORT, () => {
      console.log('Server Running at http://localhost:3000/');
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

// Insert Books into the Database
const insertBooks = async () => {
  try {
    await db.run(`
      INSERT INTO
        book (title, author_id, rating, rating_count, review_count, description, pages, date_of_publication, edition_language, price, online_stores)
      VALUES
        ('bharath', 1, 4.5, 3, 2, 'read the book', 10, '2004-12-24', 'english', 1000, 'amazon'),
        ('book 2', 1, 4.0, 50, 40, 'interesting read', 250, '2015-01-15', 'english', 300, 'flipkart'),
        ('book 3', 2, 4.8, 100, 90, 'highly recommended', 350, '2018-09-10', 'english', 500, 'amazon'),
        ('book 4', 3, 4.2, 200, 150, 'great for learning', 150, '2020-06-01', 'english', 400, 'flipkart'),
        ('book 5', 4, 3.5, 10, 5, 'decent book', 120, '2012-05-20', 'english', 150, 'myntra');
    `);
    console.log("Books inserted successfully.");
  } catch (err) {
    console.log("Error inserting books:", err);
  }
};

initializeDBAndServer();

// Get Books API
app.get('/books/', async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        book_id;`;
    const booksArray = await db.all(getBooksQuery);
    response.send(booksArray);
  } catch (err) {
    console.error("Error fetching books:", err);
    response.status(500).send("Internal Server Error");
  }
});

// Get Book API
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;
  try {
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        book_id = ${bookId};`;
    const book = await db.get(getBookQuery);
    response.send(book);
  } catch (err) {
    console.error("Error fetching book:", err);
    response.status(500).send("Internal Server Error");
  }
});

// Add Book API
app.post('/books/', async (request, response) => {
  const bookDetails = request.body;
  const { title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionLanguage, price, onlineStores } = bookDetails;
  try {
    const addBookQuery = `
      INSERT INTO
        book (title, author_id, rating, rating_count, review_count, description, pages, date_of_publication, edition_language, price, online_stores)
      VALUES
        ('${title}', ${authorId}, ${rating}, ${ratingCount}, ${reviewCount}, '${description}', ${pages}, '${dateOfPublication}', '${editionLanguage}', ${price}, '${onlineStores}');`;
    const dbResponse = await db.run(addBookQuery);
    const bookId = dbResponse.lastID;
    response.send({ bookId: bookId });
  } catch (err) {
    console.error("Error adding book:", err);
    response.status(500).send("Internal Server Error");
  }
});
