// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) { 

    var TT_TOOLTIP_WIDTH = 280,
        TT_TOOLTIP_HEIGHT = 180,
        TT_ARROW_SIZE = 20,
        TT_ARROW_MARGIN = 30;

    // default parameters passed to tooltip's view
    var view_defaults = {
        header: 'Add new note <a>(read more)</a>',
        btn: {
            close: '&#10006;',
            disabled: 'Add note first!',
            facebook: {
                label: 'Share on facebook'
            },
            twitter: {
                label: 'Share on twitter'
            },
            link: {
                label: 'Get direct link to your notes'    
            },
            save: {
                label: 'Save notes in browser'
            },
            submit: {
                label: 'Add note'
            }
        },
        txt: {
            placeholder: 'Type your note here...'
        }
    };

    var defaults = {
        // show tooltip on the right or top
        // left/top/right/bottom/auto
        position: 'auto',

        // position (floating) of arrow pointing on current element
        // plus/minus/center/5px
        arrow: 'center',

        // position (floating) of main tooltip window
        // plus/minus/center/5px
        window: 'center',
        
        // ractangular container which limits size and position of tooltip
        // none/$element/'5px 10 5px 100px'
        container: 'none',

        // dimensions of tooltip's window
        width: TT_TOOLTIP_WIDTH,
        height: TT_TOOLTIP_HEIGHT,
        
        // initial content of textarea
        content: ''
    };

    var fading_change = 8,
        fading_speed = 200;

    function fadeIn($element) {
        $element
            .css('width', '-=' + fading_change)
            .css('height', '-=' + fading_change)
            .css('top', '+=' + (fading_change/2))
            .css('left', '+=' + (fading_change/2))
            .css('display', 'block')
        .animate({
            width: '+=' + fading_change,
            height: '+=' + fading_change,
            top: '-=' + (fading_change/2),
            left: '-=' + (fading_change/2),
            opacity: 1.0
        }, fading_speed);
    }

    function fadeOut($element) {
        $element.animate({
            width: '-=' + fading_change,
            height: '-=' + fading_change,
            top: '+=' + (fading_change/2),
            left: '+=' + (fading_change/2),
            opacity: 0.0
        }, fading_speed, function() {
            $(this).css('display', 'none');    
        });        
    }

    function initEvents($tooltip) {
        $tooltip.on('tt.close', function() {
            fadeOut($(this));     
        });

        $tooltip.find('.tt-close').on('click', function() {
            $tooltip.trigger('tt.close');    
        });
    }

    tt.tooltip = $.extend(tt.tooltip || {}, {
        open: function(options) {
            if(typeof main_view !== 'undefined') {
                options = $.extend({}, defaults, options); 

                var $tooltip,
                    $arrow,
                    elem_width = options.root.outerWidth(),
                    elem_height = options.root.outerHeight(),
                    elem_offset = options.root.offset(),
                    tooltip_width = Math.max(options.width, TT_TOOLTIP_WIDTH),
                    tooltip_height = Math.max(options.height, TT_TOOLTIP_HEIGHT),
                    tooltip_pos = options.position,
                    tooltip_offset = null,
                    arrow_offset = null,
                    window_width = $(window).width(),
                    window_height = $(window).height(),
                    window_offset = { top: $(window).scrollTop(), left: $(window).scrollLeft() },
                    window_bottom_edge = window_offset.top + window_height,
                    window_right_edge = window_offset.left + window_width;

                if(document.doctype === null || screen.height < parseInt(window_height)) {
                    throw new Error('jNottery: Please specify doctype for your document, it\'s required for height calculation');
                } 

                $(document.body).append(nano(main_view, view_defaults));   
                $tooltip = $('.tt-tooltip');
                $arrow = $tooltip.find('.tt-arrow');

                if(tooltip_pos === 'auto') {
                        // position where minimum of tooltip is out of the screen
                    var min_cutting,
                        // min space where tooltip is fully visible
                        min_extra_space;
                    
                    $.each({
                        top: (elem_offset.top - window_offset.top) - tooltip_height,
                        left: (elem_offset.left - window_offset.left) - tooltip_width,
                        bottom: (window_bottom_edge - (elem_offset.top + elem_height)) - tooltip_height,
                        right: (window_right_edge - (elem_offset.left + elem_width)) - tooltip_width
                    }, function(pos, space) {
                        if(typeof min_cutting === 'undefined' || space > min_cutting.space)
                            min_cutting = { name: pos, space: space };
                            
                        if((space - TT_ARROW_SIZE) > 0
                            && (typeof min_extra_space === 'undefined' || space < min_extra_space.space))
                            min_extra_space = { name: pos, space: space }; 
                    });
                
                    if(typeof min_extra_space !== 'undefined')
                        min_cutting = min_extra_space;

                    tooltip_pos = min_cutting.name;
                }
    
                arrow_offset = { top: elem_offset.top, left: elem_offset.left };
            
                if(tooltip_pos === 'top' || tooltip_pos === 'bottom') {
                    if(tooltip_pos === 'bottom')
                        arrow_offset.top += elem_height;
                            
                    switch(options.arrow) {
                        case 'plus': {
                            arrow_offset.left += Math.min(elem_width, window_right_edge - elem_offset.left);
                            break;
                        }
                        case 'minus': {
                            arrow_offset.left += Math.max(0, window_offset.left - elem_offset.left); 
                            break;
                        }
                        case 'center': {
                            arrow_offset.left += Math.floor(elem_width / 2);
                            arrow_offset.left = Math.max(
                                    Math.min(arrow_offset.left, window_right_edge), 
                                    window_offset.left
                            );
                            break;
                        }
                        default: {
                            arrow_offset.left += Math.max(parseInt(options.arrow), 0);
                        }
                    }
                } else {
                    if(tooltip_pos === 'right') 
                        arrow_offset.left += elem_width;

                    switch(options.arrow) {
                        case 'plus': {
                            arrow_offset.top += Math.min(elem_height, window_bottom_edge - elem_offset.top);
                            break;
                        }
                        case 'minus': {
                            arrow_offset.top += Math.max(0, window_offset.top - elem_offset.top); 
                            break;
                        }
                        case 'center': {
                            arrow_offset.top += Math.floor(elem_height / 2);
                            arrow_offset.top = Math.max(
                                    Math.min(arrow_offset.top, window_bottom_edge), 
                                    window_offset.top
                            );
                            break;
                        }
                        default: {
                            arrow_offset.top += Math.max(parseInt(options.arrow), 0);
                        }
                    }
                }

                tooltip_offset = { top: arrow_offset.top, left: arrow_offset.left };
                
                if(tooltip_pos === 'top' || tooltip_pos === 'bottom') {
                    if(tooltip_pos === 'top')
                        tooltip_offset.top -= tooltip_height + TT_ARROW_SIZE;
                    else
                        tooltip_offset.top += TT_ARROW_SIZE;

                    switch(options.window) {
                        case 'plus': {
                            tooltip_offset.left = Math.min(arrow_offset.left, window_right_edge - tooltip_width);
                            break;
                        }
                        case 'minus': {
                            tooltip_offset.left = Math.max(arrow_offset.left - tooltip_width, window_offset.left); 
                            break;
                        }
                        case 'center': {
                            tooltip_offset.left -= Math.floor(tooltip_width / 2);
                            tooltip_offset.left = Math.max(
                                    Math.min(tooltip_offset.left, window_right_edge - tooltip_width), 
                                    window_offset.left
                            );
                            break;
                        }
                        default: {
                            tooltip_offset.left = arrow_offset.left - Math.max(parseInt(options.window), 0);
                        }
                    }
                    
                    var arrow_inner_left = arrow_offset.left - tooltip_offset.left,
                        left_margin = TT_ARROW_MARGIN - arrow_inner_left,
                        right_margin = arrow_inner_left - (tooltip_width - TT_ARROW_MARGIN);

                    if(left_margin > 0) {
                        tooltip_offset.left -= left_margin;
                        arrow_inner_left = TT_ARROW_MARGIN;
                    } else if(right_margin > 0) {
                        tooltip_offset.left += right_margin;
                        arrow_inner_left = tooltip_width - TT_ARROW_MARGIN;
                    }
                    
                    $arrow.css('left', arrow_inner_left);
                    
                } else {
                    if(tooltip_pos === 'left') 
                        tooltip_offset.left -= tooltip_width + TT_ARROW_SIZE;
                    else
                        tooltip_offset.left += TT_ARROW_SIZE;
                    
                    switch(options.window) {
                        case 'plus': {
                            tooltip_offset.top = Math.min(arrow_offset.top, window_bottom_edge - tooltip_height);
                            break;
                        }
                        case 'minus': {
                            tooltip_offset.top = Math.max(arrow_offset.top - tooltip_height, window_offset.top); 
                            break;
                        }
                        case 'center': {
                            tooltip_offset.top -= Math.floor(tooltip_height / 2);
                            tooltip_offset.top = Math.max(
                                    Math.min(tooltip_offset.top, window_bottom_edge - tooltip_height), 
                                    window_offset.top
                            );
                            break;
                        }
                        default: {
                            tooltip_offset.top = arrow_offset.top - Math.max(parseInt(options.window), 0);
                        }
                    }

                    var arrow_inner_top = arrow_offset.top - tooltip_offset.top,
                        top_margin = TT_ARROW_MARGIN - arrow_inner_top,
                        bottom_margin = arrow_inner_top - (tooltip_height - TT_ARROW_MARGIN);

                    if(top_margin > 0) {
                        tooltip_offset.top -= top_margin;
                        arrow_inner_top = TT_ARROW_MARGIN;
                    } else if(bottom_margin > 0) {
                        tooltip_offset.top += bottom_margin;
                        arrow_inner_top = tooltip_height - TT_ARROW_MARGIN;
                    }
                    
                    $arrow.css('top', arrow_inner_top);
                }
            
                // set arrow direction
                $arrow.addClass('tt-arrow-' + tooltip_pos);

                // set tooltip position 
                $tooltip.offset(tooltip_offset);

                // set tootip size
                $tooltip.outerWidth(tooltip_width).outerHeight(tooltip_height);

                // event handlers for tooltip's components
                initEvents($tooltip);

                // show tooltip
                fadeIn($tooltip);
            }
        }    
    });
})(window.tt, window.jQuery);