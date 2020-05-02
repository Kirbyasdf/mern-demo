const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MONGO DB ONLINE!!!!!");
  } catch (err) {
    console.errror(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
