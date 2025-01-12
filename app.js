require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');
const connectDB = require('./server/config/db');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 8080;
  
// Connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(cookieParser());



// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


// Routes
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));


// server listening
app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});
