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
app.get('/books', (req, res) => {
  let sql = 'SELECT * FROM books';
  let params = [];

  if (req.query.hasOwnProperty('author')) {
    if (typeof req.body.author === 'string') {
      sql += ' WHERE author = ?';
      params.push(req.query.author);
    } else {
      res.status(400).end();
    }
  }
  if (req.query.hasOwnProperty('year')) {
    if (Number.isInteger(req.query.year)){

      // check if the WHERE clause has already been added
      if (sql.includes('WHERE')) {
        sql += ' AND year = ?';
      } else {
        sql += ' WHERE year = ?';
      }
      params.push(req.query.year);
    } else {
      res.status(400).end();
    }
  }
  if (req.query.hasOwnProperty('publisher')) {
    if (typeof req.body.author === 'string') {
      // check if the WHERE clause has already been added
      if (sql.includes('WHERE')) {
        sql += ' AND publisher = ?';
      } else {
        sql += ' WHERE publisher = ?';
      }
    } else {
      res.status(400).end();
    }
    params.push(req.query.publisher);
  }

  // execute the query with the parameters
  db.all(sql, params, (err, rows) => {
    if (err) {
      // handle the error
    } else {
      res.status(200).send(rows).end();
    }
  });
});

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
