const express = require('express');
const cors = require('cors');
const app = express();

// environment variables
const PORT = 5000;

// middlewares
app.use(cors());
app.use(express.json());

// server root path
app.get('/', (req, res) => {
	res.send('nanochat server is running...');
})

app.listen(PORT, () => console.log('Listening to port', PORT));