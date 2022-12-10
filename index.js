const express = require('express');
const bodyparser = require('body-parser')

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./books.db', (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  }
});

const app = express();
app.use(bodyparser.json())
app.listen(9000);
// requests to handle

/**
* Post a book
* title: string
* author: string
* year: int
* publisher: string (optional)
* description: string (optional)
*/

app.post('/books', async (req, res) => {
  if (req.body.title && req.body.title instanceof string &&
    req.body.author && req.body.author instanceof string &&
    req.body.year && Number.isInteger(req.body.year)) {
      // required fields are there, check for optional fields


  } else {
    res.status(400).end();
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

  if (req.query.author && req.query.author instanceof string) {
    // add author clause
  }
  if (req.query.publisher && req.query.publisher instanceof string) {
    // add publisher clause
  }
  if (req.query.year && req.query.Number.isInteger(year)) {
    // add year clause
  }


})

app.get('/books/:id', async (req, res) => {
  if (req.params.id && Number.isInteger(req.params.id)){

  } else {
    res.status(404).end();
  }


})
