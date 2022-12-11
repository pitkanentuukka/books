const express = require('express');
const bodyparser = require('body-parser')

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./books.db', (err) => {
  if (err) {
    console.error(err.message)
    throw err
  } else {
    db.exec("CREATE TABLE IF NOT EXISTS books (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      title TEXT NOT NULL, \
      author TEXT NOT NULL, \
      year INT NOT NULL, \
      publisher TEXT, \
      description TEXT )"
    );
  }
});

const app = express();
app.use(bodyparser.json())
app.listen(9000);

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
    req.body.year && Number.isInteger(req.body.year)) {

    const title = req.body.title;
    const author = req.body.author;
    const year = req.body.year;
    let publisher = "";
    let description = "";

    // required fields are there, check for optional fields
    if (req.body.publisher && typeof req.body.publisher === 'string') {
      publisher = req.body.publisher;
    }
    if (req.body.description && typeof req.body.description === 'string') {
      description = req.body.description;
    }
    const sql = "INSERT INTO books (title, author, year, publisher, description) \
        VALUES (?, ?, ?, ?, ?)";
        try {
          db.run(sql, [title, author, year, publisher, description], function (err) {
            if (err) {
              console.error("err: " + err);
              res.status(500).json({error: 'insert failed'}).end();
            } else {
              const id = db.lastInsertRowId;
              console.log(id);
                  console.log(`A row has been inserted with rowid ${this.lastID}`);
              res.status(200).json({id: `${this.lastID}`}).end();
            }
          });
        } catch (e) {

        } finally {

        }

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
  const result = await db.get("SELECT * FROM books")
  console.log(result);
  res.status(200).json(result).end();


})

app.get('/books/:id', async (req, res) => {
  if (req.params.id &&!isNaN(parseInt(req.params.id))){
    db.get("select * from books where id = ?", req.params.id, function(err, row) {
      if (err) {
        console.log(err);
      }
      else if (row){
        res.status(200).json(row).end();
      } else if (!row) {
        res.status(404).end();
      }
    })
  } else {
    res.status(404).end();
  }
})

app.delete('/books/:id', async (req, res) => {
  if (req.params.id &&!isNaN(parseInt(req.params.id))) {
    db.run("delete from books where id = ?", req.params.id, function (err) {
      if (err) {
      } else if (this.changes) {
        res.status(204).end();
      } else {
        res.status(404).end();
      }
    })
  } else {
    res.status(404).end();
  }
})
