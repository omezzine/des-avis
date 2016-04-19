'use strict'
const schedule = require('node-schedule');

module.exports = function() {

	// Generate site map every day at 11pm
	let ruleSitemap = new schedule.RecurrenceRule();
	ruleSitemap.hour = 23;
	ruleSitemap.minute = 0;
	schedule.scheduleJob(ruleSitemap, function(){
	  require('./sitemap_generator')();
	});


}