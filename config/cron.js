const schedule = require('node-schedule');
const AmazonHelper = rootRequire('app/helpers/amazon');

// Fetch Items From Amazon every 24 hours
schedule.scheduleJob('* * 24 * *', function() {
    AmazonHelper.FetchItems().then(function() {
        console.log('Amazon Items fetched is done !');
    })
});