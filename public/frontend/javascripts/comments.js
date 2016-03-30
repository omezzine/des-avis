var Comments = {

    _initComment: function($el) {

        var $self = $el,
            $sub_form = $self.find('.sub-comments form');

        $self.find('[data-answer]').click(function() {
            var $subcomments = $self.find('.sub-comments');
            $('.comment').each(function() {
                $(this).find('.sub-comments').each(function() {
                    var _$this = $(this);
                    if (!_$this.is($subcomments)) {
                        _$this.hide();
                    }
                })
            })

            $subcomments.slideToggle();
            scrollToElement($self);
        });

        // init like button
        $self.find('[data-like]').each(function() {
            var $self = $(this);
            $self.click(function() {
                Comments.like($self.attr('data-like'), $self);
            });

        });

        // init delete button
        $self.find('[data-delete-comment]').each(function() {
            var $self = $(this);
            $self.click(function() {
                confirmPopup('Êtes-vous sûr de vouloir supprimer ce commentaire').done(function() {
                    Comments.delete($self.attr('data-delete-comment'), $self);
                });
            })
        });

        // init signal button
        $self.find('[data-signal-comment]').each(function() {
            var $self = $(this);
            $self.click(function() {
                Comments.signal($self.attr('data-signal-comment'), $self);
            })
        });

        // on key press enter submit sub form
        $sub_form.find('textarea.form-control').on('keypress', function(e) {
            if (e.which == 13) {
                $sub_form.submit();
            }
        });

        // Handle Adding sub Comment
        $sub_form.on('submit', function(e) {
            e.preventDefault();
            var $this = $(this),
                parent_id = $this.find('[name="parent_comment"]').val();
            $parentcomment = $("#" + parent_id);
            $.ajax({
                url: $this.attr('action'),
                type: $this.attr('method'),
                data: $this.serialize(),
                success: function(html) {
                    // clean the text area
                    $this.find('textarea').val("");
                    // create jquery object
                    var $html_comment = $(html);
                    $html_comment.hide();
                    // prepend the element to first html
                    $parentcomment.find('.sub-comments-list').prepend($html_comment);
                    $html_comment.fadeIn(1500);
                    // scroll to element
                    scrollToElement($this.find('textarea'));
                    // unbind all events from comment
                    $parentcomment.find('*').unbind();
                    // init comment
                    Comments._initComment($parentcomment);
                },
                error: function() {

                }
            });
        });

    },

    init: function() {
        $('.comment').each(function() {
            Comments._initComment($(this));
        });
    },

    like: function(comment_id, $el) {
        $.ajax({
            url: '/ajax/comments/like',
            type: 'POST',
            data: {
                comment_id: comment_id,
                _csrf: $('head [name="token"]').attr('content')
            },
            success: function(data) {
                $el.toggleClass('active');
                $el.find('.likes').text(data.likes);
            }
        });
    },

    signal: function(comment_id, $el) {
        $.ajax({
            url: '/ajax/comments/signal',
            type: 'POST',
            data: {
                comment_id: comment_id,
                _csrf: $('head [name="token"]').attr('content')
            },
            success: function(data) {
                showSuccessPopup(data.message);
                $el.hide('slow', function() {
                    $el.remove();
                });
            }
        });
    },

    delete: function(comment_id, $el) {
        $.ajax({
            url: '/ajax/comments/delete',
            type: 'POST',
            data: {
                comment_id: comment_id,
                _csrf: $('head [name="token"]').attr('content')
            },
            success: function(data) {
                //showSuccessPopup(data.message);
                var $comment = $('#' + comment_id);
                $comment.fadeOut(800, function() {
                    $comment.remove();
                });
                if ($comment.hasClass('comment')) {
                    var $el_comment_count = $('span[data-comments-count]'),
                        new_comment_count = Number($el_comment_count.attr('data-comments-count')) - 1;
                    $el_comment_count.attr('data-comments-count', new_comment_count).html("(" + new_comment_count + ")");
                }
            }
        });
    }
}


$(document).ready(function() {

    Comments.init();

})