'use strict';


class LinkGenerator {

	static GenerateCategoryUrl(slug) {
		return "/avis/"+slug;
	}
	
	static GenerateItemUrl(categorySlug, itemSlug) {
		return "/avis/"+categorySlug+"/"+itemSlug;
	}
}





module.exports = LinkGenerator;