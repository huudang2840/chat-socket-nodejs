var mongoose = require('mongoose');
var historyChatSchema = mongoose.Schema({
    username: String,
    time: String,
    text: String,
    room: String,
});
var History = mongoose.model('History', historyChatSchema);
module.exports = History;