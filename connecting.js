const mongoose = require('mongoose');

const connect = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online-job-portal';
    await mongoose.connect(uri);
    // , {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });

    console.log('mongodb connected');

  } catch (error) {

    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);

  }
};

module.exports = connect;