const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readAndAppend, readFromFile, writeToFile } = require('./public/assets/helpers/fsUtils');

//const api = require('./public/assets/js/notes.js');

const PORT = process.env.port || 3001;

const app = express();

// Import custom middleware, "cLog"

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('/api/notes', api);

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for feedback page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// add Delete option//
app.delete('/api/notes/:id', (req, res) => {
    var targetId = req.params.id
    readFromFile('./db/db.json').then((data) => {
        let jsonNotes = (JSON.parse(data));
        const result = jsonNotes.filter((note) => note.id !== targetId);
        writeToFile('./db/db.json', result);

        res.json(`Item ${targetId} has been deleted 🗑️`);
    });
})


app.post('/api/notes', (req, res) => {
    // Destructuring assignment for the items in req.body
    const { title, text } = req.body;

    // If all the required properties are present
    if (title && text) {
        // Variable for the object we will save
        const newNote = {
            "title": title,
            "text": text,
            "id": uuidv4(),
        };

        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success',
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Error in posting note');
    }
});

app.get('/api/notes', (req, res) => {
    readFromFile('./db/db.json')
    .then((data) => {
        res.json(JSON.parse(data))
    });
});


app.get('/api/notes/:id', (req, res) => {
    const targetId = req.params.id;
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        const result = json.filter((note) => note.id === targetId);
        return result.length > 0
          ? res.json(result)
          : res.json('No tip with that ID');
      });
  });

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT} 🚀`)
);
