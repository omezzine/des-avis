$(document).ready(function() {

    // init datepicker
    $('.datepicker').datepicker({
        autoclose: true
    });

    // init rating
    $("[data-rating-display]").rating({
        displayOnly: true,
        min: 0,
        max: 5,
        size: 'xs',
        theme: 'krajee-fa',
        filledStar: '<i class="fa fa-star gold"></i>',
        emptyStar: '<i class="fa fa-star-o"></i>'
    });

    $("[data-rating]").rating({
        min: 0,
        max: 5,
        step: 0.5,
        size: 'xs',
        starCaptions: function(rating) {
            return rating;
        },
        theme: 'krajee-fa',
        showClear: false,
        clearCaption: 'Donnez une note',
        filledStar: '<i class="fa fa-star gold"></i>',
        emptyStar: '<i class="fa fa-star-o"></i>'
    });

    $("[data-rating]").on('change', function() {
        $('[data-rate-form]').submit();
    });

    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('a.cd-top');

    //hide or show the "back to top" link
    $(window).scroll(function() {
        ($(this).scrollTop() > offset) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $back_to_top.on('click', function(event) {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        }, scroll_top_duration);
    });

    // init tooltip
    $('[data-toggle="tooltip"]').tooltip();

    $warningPopup = $('#warning');
    $successPopup = $('#success');
    $commentContainer = $('.row.comments .well.box-shadow');

    window.scrollToElement = function(el) {
        $('html, body').animate({
            scrollTop: el.offset().top
        }, 500);
    }


    // show success popup
    window.showSuccessPopup = function(message) {
        $successPopup.find('.modal-body').html(message);
        $successPopup.modal('show');
    }

    // comfirm popup
    window.confirmPopup = function(message) {
        var dfd = jQuery.Deferred();
        if (!$('#dataConfirmModal').length) {
            $('body').append('<div id="dataConfirmModal" class="modal" role="dialog" aria-labelledby="dataConfirmLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button><h3 id="dataConfirmLabel">Merci de confirmer</h3></div><div class="modal-body"></div><div class="modal-footer"><button class="btn" data-dismiss="modal" aria-hidden="true">Non</button><a class="btn btn-danger" id="dataConfirmOK">Oui</a></div></div></div></div>');
        }
        var $modal = $('#dataConfirmModal');
        $modal.find('.modal-body').text(message);
        $modal.modal({
            show: true
        });
        $modal.find('#dataConfirmOK').click(function() {
            dfd.resolve();
            $modal.modal('hide');
        })
        return dfd.promise();
    }


    // Handling Ajax Errors
    $(document).ajaxError(function(event, request, settings) {
        var message;
        if (!request.responseText || request.responseText == "null") {
            message = "Désolé, nous avons rencontré un problème";
        } else {
            message = JSON.parse(request.responseText).message;
        }
        $warningPopup.find('.modal-body').html(message);
        $warningPopup.modal('show');
        var $form = $('form');
        $form.find('textarea').attr('disabled', false);
    });

    // Ajax Start
    $(document).ajaxStart(function() {
        var $form = $('form');
        $form.find('textarea').attr('disabled', true);
    });
    // Ajax Success
    $(document).ajaxSuccess(function() {
        var $form = $('form');
        $form.find('textarea').attr('disabled', false);
    });

    // Handle Adding Comments
    $('[data-comment-form]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function(html) {
                //showSuccessPopup('Votre commentaire a été ajouté')
                var $el = $(html);
                $el.hide();
                $this.find('textarea').val('');
                $commentContainer.find('h2:first').after($el);
                $el.fadeIn(2000);
                scrollToElement($commentContainer.find('h2:first').parent());
                $('[data-no-comment]').remove();
                var $el_comment_count = $('span[data-comments-count]'),
                    new_comment_count = Number($el_comment_count.attr('data-comments-count')) + 1;
                $el_comment_count.attr('data-comments-count', new_comment_count).html("(" + new_comment_count + ")");
                Comments._initComment($el);
            },
            error: function() {
                $('form').find('textarea').attr('disabled', false);
            }
        });
    });

    // rate submit form
    $('[data-rate-form]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function() {},
            error: function() {;
            }
        });
    });

    // contact submit form
    $('[data-contact-form]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this),
            data = $this.serialize();
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: data,
            success: function(data) {
                $('#contact').modal('hide');
                showSuccessPopup(data.message);
            },
            error: function() {;
            }
        });
    });

    // Facebook / Google oauth
    $('[data-oauth]').click(function() {
        var $self = $(this),
            url = $self.attr("data-oauth"),
            width = 1000,
            height = 650,
            top = (window.outerHeight - height) / 2,
            left = (window.outerWidth - width) / 2;
        console.log($self.attr("data-oauth"));
        window.open(url, 'Login', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
    });

    // Local Auth
    $('[data-auth-local]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function(data) {
                window.location.reload();
            }
        });
    });

    // Forget Password
    $('[data-auth-forgot]').on('submit', function(e) {
        e.preventDefault();
        $('#forgot_password').modal('hide');
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function(data) {
                showSuccessPopup(data.message);
            }
        });
    });

    // Signup
    $('[data-auth-signup]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function(data) {
                $('#signup').modal('hide');
                showSuccessPopup(data.message);
            }
        });
    });

    // popup rate
    $('[data-popuprate-form]').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this);
        $.ajax({
            url: $this.attr('action'),
            type: $this.attr('method'),
            data: $this.serialize(),
            success: function(data) {
                $('#popuprate').modal('hide');
                $('input[data-rating]').rating('update', $this.find('input[data-rating-popup]').val());
                showSuccessPopup(data.message);
            }
        });
    });


})