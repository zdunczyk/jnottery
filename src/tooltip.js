// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) { 

    var TT_TOOLTIP_WIDTH = 280,
        TT_TOOLTIP_HEIGHT = 180,
        TT_ARROW_SIZE = 20,
        TT_ARROW_MARGIN = 30,
        $tooltip;

    // default parameters passed to tooltip's view
    var view_defaults = {
        title: 'Add note',
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
                label: 'Add'
            },
            edit: {
                label: 'Edit'
            },
            del: {
                label: 'Delete'
            }
        },
        txt: {
            placeholder: 'Type your note here...',
            attr: '',
            content: ''
        }
    };

    var events = {
        click: {
            'btn.facebook': '.tt-facebook.tt-active',
            'btn.twitter': '.tt-twitter.tt-active',
            'btn.link': '.tt-link.tt-active',
            'btn.save': '.tt-save.tt-active',
            'btn.submit': '.tt-add',
            'btn.edit': '.tt-edit',
            'btn.close': '.tt-close',
            'btn.delete': '.tt-del'
        }    
    };

    var events_propagate = {
        'btn.close.click': 'close',
        'btn.submit.click': 'submit',
        'btn.delete.click': 'delete'
    };

    var edit = false;

    var defaults = {
        // show tooltip on the right or top
        // left/top/right/bottom/auto
        position: 'auto',

        // position (floating) of arrow pointing on current element
        // plus/minus/center/5px
        arrow: 'center',

        // position (floating) of main tooltip window
        // plus/minus/center/5px
        align: 'center',
        
        // ractangular container which limits size and position of tooltip
        // none/$element/'5px 10 5px 100px'
        container: 'none',

        // dimensions of tooltip's window
        width: TT_TOOLTIP_WIDTH,
        height: TT_TOOLTIP_HEIGHT,
        
        // initial content of textarea
        content: '',

        title: false,
        
        edit: false,

        // callbacks
        init: false
    };

    var fading_change = 8,
        fading_speed = 200;

    function find(class_suffix) {
        return $tooltip.find('.tt-' + class_suffix);
    }

    function fadeIn($element) {
        $element
            .css('width', '-=' + fading_change)
            .css('height', '-=' + fading_change)
            .css('top', '+=' + (fading_change/2))
            .css('left', '+=' + (fading_change/2))
            .css('display', 'block')
        .stop()
        .animate({
            width: '+=' + fading_change,
            height: '+=' + fading_change,
            top: '-=' + (fading_change/2),
            left: '-=' + (fading_change/2),
            opacity: 1.0
        }, fading_speed);
    }

    function fadeOut($element) {
        $element.stop().animate({
            width: '-=' + fading_change,
            height: '-=' + fading_change,
            top: '+=' + (fading_change/2),
            left: '+=' + (fading_change/2),
            opacity: 0.0
        }, fading_speed, function() {
            $(this).css('display', 'none');    
        });        
    }

    function attachEvents($tooltip, params) {
        $.each(events_propagate, function(src, dest) {
            $tooltip.on(src + '.tt', function() {
                $(this).trigger(dest + '.tt', [ params ]);
            });
        });

        $.each(events, function(type, names) {
            $.each(names, function(name, elem_id) {
                (function(name, type) {
                    $tooltip.on(type, elem_id, function() {
                        $tooltip.trigger(name + '.' + type + '.tt', [ params ]);    
                    });
                })(name, type); 
            });    
        });

        $tooltip.on('btn.close.click.tt', function() {
            fadeOut($(this));
        });
    }

    function outerBoundary(collection) {
        var result = {};

        collection.each(function() {
            var width = $(this).outerWidth(),
                height = $(this).outerHeight(),
                offset = $(this).offset();

            if(typeof result.left === 'undefined' || offset.left < result.left)
                result.left = offset.left;

            if(typeof result.top === 'undefined' || offset.top < result.top)
                result.top = offset.top;

            if(typeof result.right === 'undefined' || (offset.left + width) > result.right)
                result.right = offset.left + width;

            if(typeof result.bottom === 'undefined' || (offset.top + height) > result.bottom)
                result.bottom = offset.top + height;
        });

        result.width = result.right - result.left;
        result.height = result.bottom - result.top;
        return result;
    }

    function windowBoundary() {
        var result = {
            width: $(window).width(),
            height: $(window).height(),
            top: $(window).scrollTop(),
            left: $(window).scrollLeft(),
        };
        
        result.bottom = result.top + result.height;
        result.right = result.left + result.width;
        return result;
    }

    function containerBoundary($container, target) {
        var cont_offset = $container.offset(),
            result = {
                width: $container.outerWidth(),
                height: $container.outerHeight(),
                top: cont_offset.top,
                left: cont_offset.left
            };
        
        result.bottom = result.top + result.height,
        result.right = result.left + result.width;

        if(result.right < target.left)
            result.tooltip_pos = 'left';
        else if(result.left > (target.left + target.width))
            result.tooltip_pos = 'right';
        else if(result.bottom < (target.top + (target.height / 2)))
            result.tooltip_pos = 'top';
        else
            result.tooltip_pos = 'bottom';

        return result;
    }

    function calcPosition(tooltip, target, win) {
            // position where minimum of tooltip is out of the screen
        var min_cutting,
            // min space where tooltip is fully visible
            min_extra_space;
        
        $.each({
            top: (target.top - win.top) - tooltip.height,
            left: (target.left - win.left) - tooltip.width,
            bottom: (win.bottom - (target.top + target.height)) - tooltip.height,
            right: (win.right - (target.left + target.width)) - tooltip.width
        }, function(pos, space) {
            if(typeof min_cutting === 'undefined' || space > min_cutting.space)
                min_cutting = { name: pos, space: space };
                
            if((space - TT_ARROW_SIZE) > 0
                && (typeof min_extra_space === 'undefined' || space < min_extra_space.space))
                min_extra_space = { name: pos, space: space }; 
        });
    
        if(typeof min_extra_space !== 'undefined')
            min_cutting = min_extra_space;

        return min_cutting.name;
    }

    function arrowOffset(tooltip_pos, arrow_pos, target, win) {
        var arrow_offset = { top: target.top, left: target.left };
    
        if(tooltip_pos === 'top' || tooltip_pos === 'bottom') {
            if(tooltip_pos === 'bottom')
                arrow_offset.top += target.height;
                    
            switch(arrow_pos) {
                case 'plus': {
                    arrow_offset.left += Math.min(target.width, win.right - target.left - TT_ARROW_MARGIN);
                    break;
                }
                case 'minus': {
                    arrow_offset.left += Math.max(0, win.left - target.left + TT_ARROW_MARGIN); 
                    break;
                }
                case 'center': {
                    arrow_offset.left += Math.floor(target.width / 2);
                    arrow_offset.left = Math.max(
                            Math.min(arrow_offset.left, win.right - TT_ARROW_MARGIN), 
                            win.left + TT_ARROW_MARGIN
                    );
                    break;
                }
                default: {
                    arrow_offset.left += Math.max(parseInt(arrow_pos), 0);
                }
            }
        } else {
            if(tooltip_pos === 'right') 
                arrow_offset.left += target.width;

            switch(arrow_pos) {
                case 'plus': {
                    arrow_offset.top += Math.min(target.height, win.bottom - target.top - TT_ARROW_MARGIN);
                    break;
                }
                case 'minus': {
                    arrow_offset.top += Math.max(0, win.top - target.top + TT_ARROW_MARGIN); 
                    break;
                }
                case 'center': {
                    arrow_offset.top += Math.floor(target.height / 2);
                    arrow_offset.top = Math.max(
                            Math.min(arrow_offset.top, win.bottom - TT_ARROW_MARGIN), 
                            win.top + TT_ARROW_MARGIN
                    );
                    break;
                }
                default: {
                    arrow_offset.top += Math.max(parseInt(arrow_pos), 0);
                }
            }
        }
        return arrow_offset;
    }

    function arrowToContainer(arrow_offset, tooltip_pos, container) {

        switch(tooltip_pos) {
            case 'right': {
                arrow_offset.left = container.left;        
                break;
            }
            case 'left': {
                arrow_offset.left = container.right;            
                break;
            }
            case 'top': {
                arrow_offset.top = container.bottom;        
                break;
            }
            case 'bottom': {
                arrow_offset.top = container.top;
                break;
            }
        }

        if(tooltip_pos === 'right' || tooltip_pos === 'left') {
            arrow_offset.top = Math.max(
                Math.min(arrow_offset.top, container.bottom - TT_ARROW_MARGIN), 
                container.top + TT_ARROW_MARGIN
            );
        } else {
            arrow_offset.left = Math.max(
                Math.min(arrow_offset.left, container.right - TT_ARROW_MARGIN), 
                container.left + TT_ARROW_MARGIN
            );
        }
    }

    function calcTooltip(tooltip_align, arrow_offset, tooltip_pos, tooltip, win, container) {
        var tooltip_offset = { top: arrow_offset.top, left: arrow_offset.left },
            arrow_adjust = {};
        
        if(tooltip_pos === 'top' || tooltip_pos === 'bottom') {
            if(tooltip_pos === 'top')
                tooltip_offset.top -= tooltip.height + TT_ARROW_SIZE;
            else
                tooltip_offset.top += TT_ARROW_SIZE;

            switch(tooltip_align) {
                case 'plus': {
                    tooltip_offset.left = Math.min(arrow_offset.left, win.right - tooltip.width);
                    break;
                }
                case 'minus': {
                    tooltip_offset.left = Math.max(arrow_offset.left - tooltip.width, win.left); 
                    break;
                }
                case 'center': {
                    tooltip_offset.left -= Math.floor(tooltip.width / 2);
                    tooltip_offset.left = Math.max(
                            Math.min(tooltip_offset.left, win.right - tooltip.width), 
                            win.left
                    );
                    break;
                }
                default: {
                    tooltip_offset.left = arrow_offset.left - Math.max(parseInt(tooltip_align), 0);
                }
            }

            if(container) {
                tooltip_offset.left = Math.max(
                        Math.min(tooltip_offset.left, container.right - tooltip.width), 
                        container.left
                );                        
            }
            
            var arrow_inner_left = arrow_offset.left - tooltip_offset.left,
                left_margin = TT_ARROW_MARGIN - arrow_inner_left,
                right_margin = arrow_inner_left - (tooltip.width - TT_ARROW_MARGIN);

            if(left_margin > 0) {
                tooltip_offset.left -= left_margin;
                arrow_inner_left = TT_ARROW_MARGIN;
            } else if(right_margin > 0) {
                tooltip_offset.left += right_margin;
                arrow_inner_left = tooltip.width - TT_ARROW_MARGIN;
            }
            
            arrow_adjust = { left: arrow_inner_left, top: '' };
            
        } else {
            if(tooltip_pos === 'left') 
                tooltip_offset.left -= tooltip.width + TT_ARROW_SIZE;
            else
                tooltip_offset.left += TT_ARROW_SIZE;
            
            switch(tooltip_align) {
                case 'plus': {
                    tooltip_offset.top = Math.min(arrow_offset.top, win.bottom - tooltip.height);
                    break;
                }
                case 'minus': {
                    tooltip_offset.top = Math.max(arrow_offset.top - tooltip.height, win.top); 
                    break;
                }
                case 'center': {
                    tooltip_offset.top -= Math.floor(tooltip.height / 2);
                    tooltip_offset.top = Math.max(
                            Math.min(tooltip_offset.top, win.bottom - tooltip.height), 
                            win.top
                    );
                    break;
                }
                default: {
                    tooltip_offset.top = arrow_offset.top - Math.max(parseInt(tooltip_align), 0);
                }
            }

            if(container) {
                tooltip_offset.top = Math.max(
                        Math.min(tooltip_offset.top, container.bottom - tooltip.height), 
                        container.top
                );                        
            }

            var arrow_inner_top = arrow_offset.top - tooltip_offset.top,
                top_margin = TT_ARROW_MARGIN - arrow_inner_top,
                bottom_margin = arrow_inner_top - (tooltip.height - TT_ARROW_MARGIN);

            if(top_margin > 0) {
                tooltip_offset.top -= top_margin;
                arrow_inner_top = TT_ARROW_MARGIN;
            } else if(bottom_margin > 0) {
                tooltip_offset.top += bottom_margin;
                arrow_inner_top = tooltip.height - TT_ARROW_MARGIN;
            }
            
            arrow_adjust = { top: arrow_inner_top, left: '' };
        }

        return {
            offset: tooltip_offset,
            arrow_adjust: arrow_adjust
        };
    }

    function processOptions(options) {
        var result = {
            target: outerBoundary(options.root),
            win: windowBoundary(),
            tooltip: {
                width: Math.max(options.width, TT_TOOLTIP_WIDTH),
                height: Math.max(options.height, TT_TOOLTIP_HEIGHT)
            },
            tooltip_pos: options.position,
            arrow_offset: null,
            container: null
        };

        if(document.doctype === null || screen.height < parseInt(result.win.height)) {
            throw new Error('jNottery: Please specify doctype for your document, it\'s required for height calculation');
        } 

        if(options.container instanceof $) {
            result.container = containerBoundary(options.container, result.target);
            result.tooltip_pos = result.container.tooltip_pos;
        }
        
        if(result.tooltip_pos === 'auto' && !result.container)
            result.tooltip_pos = calcPosition(result.tooltip, result.target, result.win);
        
        result.arrow_offset = arrowOffset(result.tooltip_pos, options.arrow, result.target, result.win);
        
        if(result.container)
            arrowToContainer(result.arrow_offset, result.tooltip_pos, result.container);

        return result;
    }
    
    function open() {
        return typeof $tooltip !== 'undefined';
    }

    tt.tooltip = $.extend(tt.tooltip || {}, {
        close: function() {
            if(open())
                $tooltip.trigger('close.tt'); 
        },
        open: function(options) {
            this.close();

            if(typeof main_view !== 'undefined') {
                options = $.extend({}, defaults, options);

                var $arrow,
                    params = processOptions(options),
                    view_options = $.extend({}, view_defaults, options.view);
               
                if(typeof $tooltip === 'undefined') {
                    $tooltip = $(nano(main_view, view_options));
                    $(document.body).append($tooltip);   
                    
                    // event handlers for tooltip's components
                    attachEvents($tooltip, this);

                    if($.type(options.init) === 'function') 
                        options.init($tooltip);

                // only title is reupdated!
                } else if(view_options.title) {
                    this.title(view_options.title);
                }
               
                find('input').val(options.content);
                this.switchEditMode(this.edit(options.edit ? options.edit : false));
                 
                $arrow = find('arrow');

                var tooltip_calculations = calcTooltip(
                        options.align, 
                        params.arrow_offset, 
                        params.tooltip_pos, 
                        params.tooltip, 
                        params.win, 
                        params.container
                );
                
                // adjust arrow position inside tooltip's window 
                $arrow.css(tooltip_calculations.arrow_adjust);
                
                // set arrow direction
                $arrow.removeClass().addClass('tt-arrow').addClass('tt-arrow-' + params.tooltip_pos);
                
                // set tooltip position 
                $tooltip.css(tooltip_calculations.offset);

                // set tootip size
                $tooltip.outerWidth(params.tooltip.width).outerHeight(params.tooltip.height);

                // show tooltip
                fadeIn($tooltip);

                return $tooltip;
            }
        },
        // when invoked without params, simply returns currently edited note
        edit: function(id) {
            if(id === false) {
                edit = false;
            } else if(typeof id !== 'undefined') {
                edit = id;
            }

            return edit;
        },
        switchEditMode: function(on) {
            var btn_modifier;

            if(!on) {
                find('input').removeProp('readonly');
                
                btn_modifier = function(key, val) {
                    find(val).removeClass('tt-active');    
                };

                find('add').show();
                find('edit').add(find('del')).hide();
            } else {
                find('input').prop('readonly', true); 
                
                btn_modifier = function(key, val) {
                    find(val).addClass('tt-active');    
                };
                
                find('add').hide();
                find('edit').add(find('del')).show();
            }

            if($.type(btn_modifier) === 'function')
                $.each(['facebook', 'twitter', 'link', 'save'], btn_modifier);
        },
        content: function(val) {
            var $input;

            if(open()) {
                $input = find('input');
                if(typeof val === 'undefined')
                    return $input.val();

                $input.val(val);
            }
            return val;
        },
        arrowPosition: function(options) {
            return processOptions($.extend({}, defaults, options)).arrow_offset;
        },
        title: function(txt) {
            find('title').text(txt);    
        }
    });
})(window.tt, window.jQuery);