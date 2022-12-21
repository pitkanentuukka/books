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

exports.checkDuplicate = async  (title, author, year) => {
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

exports.addBook = async (params) => {
  const sql = "INSERT INTO books (title, author, year, publisher, description) VALUES (?, ?, ?, ?, ?)";
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const id = this.lastID;
        resolve(id);
      }
    });
  });
};

exports.getABook = async (id) => {
  return new Promise((resolve, reject) => {
    db.get("select * from books where id = ?", id, function(err, row) {
      if (err) {
        console.log(err);
        reject(err);
      }
      if (row) {
        resolve(row);
      } else {
        resolve(null);
      }
    });
  });
};

exports.deleteABook = async (id) => {
  return new Promise((resolve, reject) => {
    db.run("delete from books where id = ?", id, function (err) {
      if (err) {
        reject(err);
      } else resolve(this.changes);
    });
  });
}

exports.getBooks = async (params) => {
    let sql = 'SELECT * FROM books';
    const values = []
    if (params.hasOwnProperty('author')) {
      values.push(params.author);
      sql += ' WHERE LOWER(author) = ?';
    }
    if (params.hasOwnProperty('year')) {
      if (sql.includes('WHERE')) {
        sql += ' AND year = ?';
      } else {
        sql += ' WHERE year = ?';
      }
      values.push(params.year);
    }
    if (params.hasOwnProperty('publisher')) {
      if (sql.includes('WHERE')) {
        sql += ' AND LOWER(publisher) = ?';
      } else {
        sql += ' WHERE LOWER(publisher) = ?';
      }
      values.push(params.publisher);
    }
    return new Promise((resolve, reject) => {
      db.all(sql, values, function (err, rows) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log(rows);
          resolve (rows);
        }
      });
  });
}
