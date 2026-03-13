const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/online-job-portal');
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