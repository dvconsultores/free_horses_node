require('dotenv').config();
var express = require('express');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: '*'
}));


app.use('/api/', require('./src/routes')); 

app.listen(3070, () => {
    console.log('Server Server running on port 3070');
});