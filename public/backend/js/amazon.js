jQuery(document).ready(function() {

    function formatJson(object) {
        var _tmp = [];

        for (var key in object) {
            if (object[key]['id']) {
                _tmp.push({
                    id: object[key]['id'],
                    category: object[key]['category'],
                    thumbnail: object[key]['thumbnail'],
                    label: object[key]['label'],
                });
            }
        }
        return _tmp;
    }

    jQuery("#select-all").change(function() {
        jQuery("input:checkbox").prop('checked', jQuery(this).prop("checked"));
    });

    $('#create-items').on('submit', function(e) {
        e.preventDefault();
        var $form = $(this);
        var data = formatJson($form.serializeObject().item);

        if (data.length == 0) {
        	alert('No item selected')
        } else {
	         $.ajax({
	            url: $form.attr('action'),
	            type: $form.attr('method'),
	            data: {items: JSON.stringify(data), _csrf: $form.find('[name="_csrf"]').val()},
	            success: function(html) {
	            },
	            error: function() {
	            }
	        });
        }


    });

});