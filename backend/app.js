const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const faceRoutes = require('./routes/faceRoutes');
const partyRoutes = require('./routes/partyRoutes');
const voterRoutes = require('./routes/voterRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voting_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(3000);
  console.log("DB connected and server is running.");
})

app.use('/faces', faceRoutes);
app.use('/', partyRoutes);
app.use('/', voterRoutes);


