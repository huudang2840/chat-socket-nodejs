const now = require('moment')

function formatMessage(username, text) {
    return {
        username,
        text,
        time: now().format('h:mm a')
    }
}

module.exports = formatMessage



