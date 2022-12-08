const express = require('express');
const cors = require('cors');
// firebase
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
// firebase key
const serviceAccount = require('./nanochat.json');
// mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
// dotenv
require('dotenv').config();


// initialize express
const app = express();

// environment variables
const PORT = 5000;

// middlewares
app.use(cors());
app.use(express.json());

// initilize firebase admin sdk
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	projectId: 'nanochat-2022'
});

const uri = process.env.DB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const messagesCollection = client.db("nanochat").collection('messages');

// server root path
app.get('/', (req, res) => {
	res.send('nanochat server is running...');
})

app.get('/all-messages', async (req, res) => {
	const token = req.headers.authorization;
	const accessToken = token.split(' ')[1];

	const getMessages = async (email) => {
		const result = await messagesCollection.find({ users: { $in: [email] } }).toArray();
		const newResult = [];

		result.map(i => {
			delete i['messages'];
			newResult.push(i);
		})

		res.send(newResult);
	}

	getAuth()
		.verifyIdToken(accessToken, true /* checks whether token revoked or not */)
		.then(payload => getMessages(payload.email))
		.catch(err => {
			if (err.code === 'auth/id-token-revoked') {
				res.json({ msg: 'revoked' });
			} else {
				res.json({ msg: 'invalid' });
			}
		})
})

app.listen(PORT, () => console.log('Listening to port', PORT));