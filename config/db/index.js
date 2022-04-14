const mongoose = require("mongoose");

async function connection() {
  try {
    // config database
        await mongoose.connect('mongodb://localhost:27017/auth');
        console.log('Successful')
  } catch (error) {
        console.log('Fail')
  }
}
module.exports = {connection}
