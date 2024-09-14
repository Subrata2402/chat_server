const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const { createServer } = require('http');
const setupSocket = require('./socket');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes');
const getRoutes = require('./routes/getRoutes');
require('./database/db');

const server = createServer(app);
setupSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

app.use('/api', postRoutes);
app.use('/api', getRoutes);

app.get('/', (_, res) => {
  res.send('Hello World from Doux Chat App');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});