'use strict';

const sm = require('sitemap');
const ItemsHelper = rootRequire('app/helpers/items')
const fs = require('fs');

module.exports = function() {

	ItemsHelper.LoadItemsForSiteMap().then(function(items){
		var urls = [];
		items.forEach(function(item) {
			urls.push({
				url: "/avis/"+item.slug,
				changefreq: 'daily',
				priority: 0.5
			});
			createSiteMap(urls);
		})
	}, function(err) {
		console.log(err);
	})

	function createSiteMap(urls) {
	    let sitemap = sm.createSitemap({
	        hostname: 'http://www.des-avis.fr',
	        cacheTime: 600000, // 600 sec - cache purge period 
	        urls: urls
	    });

	    fs.writeFileSync("public/sitemap.xml", sitemap.toString());		
	}

}