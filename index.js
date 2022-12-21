const express = require('express');
const bodyparser = require('body-parser')
const db = require('./sql.js')
const app = express();
app.use(bodyparser.json())
app.listen(9000);


function isIntegerOrZeroDecimals(n) {
  if (typeof n !== 'number') return false;
  // Check if the input has no decimals or the decimals are equal to 0
  return n % 1 === 0 || n % 1 === -0;
}




/**
* Post a book
* title: string
* author: string
* year: int
* publisher: string (optional)
* description: string (optional)
*/

app.post('/books', async (req, res) => {

  if (req.body.title && typeof req.body.title === 'string' &&
    req.body.author && typeof req.body.author === 'string' &&
    req.body.year && isIntegerOrZeroDecimals(Number(req.body.year))) {

    let publisher = "";
    let description = "";

    // let's see if this one exists yet
    if (await db.checkDuplicate(req.body.title, req.body.author, req.body.year)) {
      // the return statement is there to prevent "headers already sent" error
      return res.status(400).end();
    } else {
      if (req.body.publisher && typeof req.body.publisher === 'string') {
        publisher = req.body.publisher;
      }
      if (req.body.description && typeof req.body.description === 'string') {
        description = req.body.description;
      }
      let params = [];

      params.push(req.body.title);
      params.push(req.body.author);
      params.push(req.body.year);
      params.push(publisher);
      params.push(description);

      try {
        const id = await db.addBook(params);
        return res.status(200).json({"id":id}).end();
      } catch (e) {
        return res.status(500).json(e).end();
      }
    }
  } else {
    return res.status(400).end();
  }
})

/**
* Get all books
* If there are query parameters, limit by parameter
* author: string
* year: int
* publisher: string
**/
app.get('/books', async (req, res) => {
  let params = {};

  if (req.query.author) {
      if (typeof req.query.author === 'string') {
      params.author=req.query.author.toLowerCase();
    } else {
      return res.status(400).end();
    }
  }
  if (req.query.year) {
    if (isIntegerOrZeroDecimals(Number(req.query.year))){
      params.year = req.query.year;
    } else {
      return res.status(400).end();
    }
  }
  if (req.query.publisher) {
    if (typeof req.query.publisher === 'string') {
      params.publisher = req.query.publisher.toLowerCase();
    } else {
      return res.status(400).end();
    }
  }
  try {
    const rows = await db.getBooks(params);
    return res.status(200).send(rows).end();
  } catch (e) {
    console.log(e);
    return res.status(500).json(e).end();
  }
});

/**
* get a book by id
* returns either a single book or 404
*/
app.get('/books/:id', async (req, res) => {
  if (req.params.id && isIntegerOrZeroDecimals(Number(req.params.id))){
    const book = await db.getABook(req.params.id);
    if (book) {
      return res.status(200).json(book).end();
    } else {
      return res.status(404).end();
    }
  } else {
    return res.status(404).end();
  }
})

/**
* delete a book
* takes id, returns 204 on success and 404 if no book is found
*/
app.delete('/books/:id', async (req, res) => {
  if (req.params.id && isIntegerOrZeroDecimals(Number(req.params.id))) {
    if (await db.deleteBook(req.params.id)) {
      return res.status(204).end();
    } else {
      return res.status(404).end();
    }
  } else {
    return res.status(404).end();
  }
});
