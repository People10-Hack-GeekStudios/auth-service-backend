require('dotenv').config();
process.env.TZ = 'UTC' //'Asia/Calcutta'
const express = require('express');
var cors = require('cors')
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors())
app.set('trust proxy', 1);

const authRoute = require('./routes/v1/auth');
app.use('/v1', authRoute);

const server = app.listen(
  PORT,
  () => console.log(`Auth service is running on port : ${PORT}`)
)