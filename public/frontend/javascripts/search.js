jQuery(document).ready(function() {

    _.templateSettings = {
        interpolate: /\{\{=(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g,
    };
    //var $template = _.template($('typehead-template').html(), {});
    var $search = $('#search');

    function hightlight(text) {
        var search = $search.val();
        return text.replace(search, "<strong>" + search + "</strong>");
    }
    function rate(rate) {
        if (rate) {
            return '<span class="rate"><input data-autocompete-rate type="number" value="' + rate + '">' + (rate) + '/5 </span>';
        } else {
            return '<span class="rate">Aucun Avis</span>';
        }
    }
    var items = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('label'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/search?q=%QUERY',
            wildcard: '%QUERY'
        }
    });
    $search.typeahead(null, {
        name: 'items',
        display: 'label',
        source: items,
        templates: {
            empty: [
                '<div class="empty-message">',
                'Aucun Resultat Trouvé :(',
                'Cliquer <a href="/ajouter-un-avis/" target="_blank">ici</a> pour ajouter un article',
                '</div>'
            ].join('\n'),
            suggestion: function(data) {
                setTimeout(function() {
                    // init rating
                    $("[data-autocompete-rate]").rating({
                        displayOnly: true,
                        min: 0,
                        max: 5,
                        size: 'xs',
                        theme: 'krajee-fa',
                        filledStar: '<i class="fa fa-star gold"></i>',
                        emptyStar: '<i class="fa fa-star-o"></i>'
                    });
                }, 0);
                if (!data.tmp) {
                    return ['<div class="col-md-12"><a href="/avis/' + data.category.slug + '/' + data.slug + '" target="_blank">',
                        '<div class="col-md-4">',
                        '<span class="thumbnail"><img src="' + data.thumbnail + '" /></span>',
                        '</div>',
                        '<div class="col-md-8">',
                        '<span class="category">' + data.category.label + '</span>',
                        hightlight(data.label) + ' - ',
                        rate(data.rate),
                        '</div>',
                        '</a></div>'
                    ].join("");
                } else {
                    return ['<div class="col-md-12"><a href="/avis/create" target="_blank">',
                        '<div class="col-md-4">',
                        '<span class="thumbnail"><img src="' + data.thumbnail + '" /></span>',
                        '</div>',
                        '<div class="col-md-8">',
                        hightlight(data.label),
                        '</div>',
                        '</a></div>'
                    ].join("");
                }

            }
        }
    });
});