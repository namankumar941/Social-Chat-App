const mongoose = require("mongoose");

const messagesSchema = mongoose.Schema({
    interactionID: {
        type : String,
    },
    messages: {
        type : [String],
        default: []
    },
},{timestamps : true});


const messages = mongoose.model("messages",messagesSchema);
module.exports = messages;