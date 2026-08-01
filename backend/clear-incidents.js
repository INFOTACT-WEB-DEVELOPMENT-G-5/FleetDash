const mongoose = require('mongoose');
require('dotenv').config();
const Incident = require('./models/Incident');

const clear = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Incident.deleteMany({});
  console.log('Cleared all incidents');
  await mongoose.disconnect();
};

clear();