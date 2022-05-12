require('dotenv').config();
const fs = require('fs');
const https = require('https');
var express = require('express');
const app = express();
const cors = require('cors');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/nearp2p.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/nearp2p.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/nearp2p.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};


app.use(cors({
  origin: '*'
}));

// Starting both http & https servers
const httpsServer = https.createServer(credentials, app);

app.use('/api/', require('./src/routes')); 

httpsServer.listen(3070, () => {
	console.log('HTTPS Server running on port 3070');
});
