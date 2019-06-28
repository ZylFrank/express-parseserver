require('dotenv').config();
const express = require('express');
const { ParseServer } = require('parse-server');
const { createServer } = require('http');
const path = require('path');
const ParseDashboard = require('parse-dashboard');

const databaseUri = process.env.DATABASE_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.'); // eslint-disable-line
}

const port = process.env.PORT || 1337;
const serverURL = process.env.SERVER_URL || 'http://localhost';
const parseUri = `${serverURL}:${port}/api`;

const api = new ParseServer({
  databaseURI: databaseUri,
  cloud: path.join(__dirname, '/cloud/main.js'),
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, // Add your master key here. Keep it secret!
  serverURL: parseUri,
  maxUploadSize: `${process.env.MAX_UPLOAD_SIZE}mb` || '20mb',
});

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api', api);

console.log('process.env.NODE_ENV', process.env.NODE_ENV);

if (process.env.NODE_ENV !== 'production') {
  const dashboard = new ParseDashboard({
    apps: [
      {
        serverURL: parseUri,
        appId: process.env.APP_ID,
        masterKey: process.env.MASTER_KEY,
        appName: process.env.APP_NAME,
      },
    ],
  });
  app.use('/dashboard', dashboard);
}



app.get('/', (req, res) => {
  res.status(200).send('OK');
});

const httpServer = createServer(app);
httpServer.listen(port, () => {
  console.log(`parse-server running on ${parseUri}`); // eslint-disable-line
});
