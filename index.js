const express = require('express');
const bodyparser = require('body-parser')

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./books.db', (err) => {
  if (err) {
    console.error(err.message)
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


function isIntegerOrZeroDecimals(n) {
  if (typeof n !== 'number') return false;
  // Check if the input has no decimals or the decimals are equal to 0
  return n % 1 === 0 || n % 1 === -0;
}

function checkDuplicate(title, author, year) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM books WHERE title = ? AND author = ? AND year = ?`;
    // Execute the SELECT statement and retrieve the row
    db.get(sql, [title, author, year], (err, row) => {
      if (err) {
        reject(err);
      }

      // Check the length of the returned row
      if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
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

  if (req.body.hasOwnProperty('title') && typeof req.body.title === 'string' &&
    req.body.hasOwnProperty('author') && typeof req.body.author === 'string' &&
    req.body.hasOwnProperty('year') && isIntegerOrZeroDecimals(Number(req.body.year))) {

    const title = req.body.title;
    const author = req.body.author;
    const year = req.body.year;
    let publisher = "";
    let description = "";

    // let's see if this one exists yet
    if (await checkDuplicate(title, author, year)) {
      // the return statement is there to prevent "headers already sent" error
      return res.status(400).end();
    } else {

      if (req.body.hasOwnProperty('publisher') && typeof req.body.publisher === 'string') {
        publisher = req.body.publisher;
      }
      if (req.body.hasOwnProperty('description') && typeof req.body.description === 'string') {
        description = req.body.description;
      }
      const sql = "INSERT INTO books (title, author, year, publisher, description) \
        VALUES (?, ?, ?, ?, ?)";
      try {
        db.run(sql, [title, author, year, publisher, description], function (err) {
          if (err) {
            return res.status(500).end();
          } else {
            const id = db.lastInsertRowId;
            return res.status(200).json({id: `${this.lastID}`}).end();
          }
        });
      } catch (e) {
        return res.status(500).end();
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
app.get('/books', (req, res) => {
  let sql = 'SELECT * FROM books';
  let params = [];

  if (req.query.hasOwnProperty('author')) {
      if (typeof req.query.author === 'string') {
      sql += ' WHERE LOWER(author) = ?';
      params.push(req.query.author.toLowerCase());
    } else {
      return res.status(400).end();
    }
  }
  if (req.query.hasOwnProperty('year')) {
    if (isIntegerOrZeroDecimals(Number(req.query.year))){

      // check if the WHERE clause has already been added
      if (sql.includes('WHERE')) {
        sql += ' AND year = ?';
      } else {
        sql += ' WHERE year = ?';
      }
      params.push(req.query.year);
    } else {
      return res.status(400).end();
    }
  }
  if (req.query.hasOwnProperty('publisher')) {
    if (typeof req.query.publisher === 'string') {
      // check if the WHERE clause has already been added
      if (sql.includes('WHERE')) {
        sql += ' AND LOWER(publisher) = ?';
      } else {
        sql += ' WHERE LOWER(publisher) = ?';
      }
    } else {
      return res.status(400).end();
    }
    params.push(req.query.publisher.toLowerCase());
  }

  // execute the query with the parameters
  db.all(sql, params, (err, rows) => {

    if (err) {
      return res.status(500).end();
    } else {
      return res.status(200).send(rows).end();
    }
  });
});

app.get('/books/:id', async (req, res) => {
  if (req.params.hasOwnProperty('id') &&isIntegerOrZeroDecimals(Number(req.params.id))){
    db.get("select * from books where id = ?", req.params.id, function(err, row) {
      if (err) {
        console.log(err);
        return res.status(500).end();
      }
      else if (row){
        return res.status(200).json(row).end();
      } else if (!row) {
        return res.status(404).end();
      }
    })
  } else {
    return res.status(404).end();
  }
})

app.delete('/books/:id', async (req, res) => {
  if (req.params.hasOwnProperty('id') &&!isIntegerOrZeroDecimals(req.params.id)) {
    db.run("delete from books where id = ?", req.params.id, function (err) {
      if (err) {
        return res.status(500).end();
      } else if (this.changes) {
        return res.status(204).end();
      } else {
        return res.status(404).end();
      }
    })
  } else {
    return res.status(404).end();
  }
})
