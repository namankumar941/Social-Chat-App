const mongoose = require("mongoose");

const friendSchema = mongoose.Schema({
    email: {
        type : String,
    },
    friendRequest: {
        type : [String],
        default: []
    },
    friends: {
        type : [String],
        default: []
    },
},{timestamps : true});


const friend = mongoose.model("friends",friendSchema);
module.exports = friend;