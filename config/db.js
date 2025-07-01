const mongoose = require('mongoose');
const uri = process.env.DATABASE_URL;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected');
});

module.exports = mongoose;
