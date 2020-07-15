//to create a User model we create a schema
//to do so we use mongoose's schema feature
const mongoose = require('mongoose');

//here is our User model schema
//which takes an object of all the fields we want
//such as name and email
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//we want to export this schema
//we create a User variable and set it equal to
// our mongoose model which takes in a generic name for that model
// and the actual schema we just created above
module.exports = User = mongoose.model('user', UserSchema);

//next head on over to users.js in routes\api to use it as a
// POST request for registration
