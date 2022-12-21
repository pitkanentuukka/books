# books
simple library api with node.js, express and sqlite

## how to use:

<code>
git clone
npm install
node index.js
</code>

The api has the following endpoints:
POST http://webapiuri/books
GET http://webapiuri/books
GET http://webapiuri/books/?querystring
GET http://webapiuri/books/:id
DELETE http://webapiuri/books

### POST http://webapiuri/books

json request body:
<code>
{
  "title": <required_string>,
  "author": <required_string>,
  "year": <required_int>,
  "publisher": <optional_string>,
  "description": <optional_string>
}
</code>
Response: 200 ok
<code>
{
  "id": id of the inserted book
}
</code>
On missing or illegal parameters, the response is 404 bad request. On server error, 500.

### GET http://webapiuri/books
With no parameters: gets all books. 

### GET http://webapiuri/books/:id
Gets a single book if found in database by id, otherwise 404.

### GET http://webapiuri/books/?querystring
Possible parameters: author (string), year (int), publisher(string). Returns an array of books based on the criteria. If none are found, returns an empty array. If parameters are illegal, returns 400 bad request. 

### DELETE http://webapiuri/books/:id
Deletes a book from the database by id. If found and deleted, returns 204 no content, if not found or id is not an integer, 404 not found.



