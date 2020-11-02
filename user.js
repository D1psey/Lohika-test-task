const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_email: String,
    button1_number: Number,
    button2_number: Number,
    button3_number: Number
});

module.exports = mongoose.model("user", userSchema);