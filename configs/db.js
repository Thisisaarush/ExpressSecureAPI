const mongoose = require("mongoose");

const connectWithDB = () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(console.log("✅ Connection with DB is Successful"))
    .catch((e) => console.log(`⛔️ Connection with DB Failed -> ${e}`));
};

module.exports = connectWithDB;
