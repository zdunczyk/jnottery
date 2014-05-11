// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) { 
    var TT_APPLIER_CLASS = 'tt-selection',
        TT_DEFAULT_ID = 'default',
        TT_NODE_TEXT = 3;
   
    var appliers = {};

    function getApplierClass(id) {
        return TT_APPLIER_CLASS + '-' + (id ? id : TT_DEFAULT_ID);
    }

    function getApplier(id) {
        !id && (id = TT_DEFAULT_ID);

        !appliers[id] && (appliers[id] = rangy.createCssClassApplier(
            getApplierClass(id) + ' tt-selection', 
            { normalize: true }
        ));
        return appliers[id];      
    }

    tt.range = $.extend(tt.range || {}, {
        serialize: function(element, range) {
            (element instanceof $) && (element = element[0]);

            var params = { idx: 0, start: null };

            if(!element.nodeType || !range)
                return { start: 0, end: 0 };

            return (function traverse(element, range, params) {
                var result = false,
                    started = false;

                if (element.nodeType === TT_NODE_TEXT) {
                    started = $.type(params.start) !== 'null';
                    
                    if(!started && element === range.startContainer) { 
                        params.start = params.idx + range.startOffset;
                        started = true;
                    }
                    
                    if(started && element === range.endContainer) {
                        return {
                            start: params.start,
                            end: params.idx + range.endOffset
                        };
                    }

                    params.idx += element.length;
                } else {
                    $(element).contents().each(function(i, child) {
                        return !(result = traverse(child, range, params));
                    });
                }
                
                return result;
            })(element, range, params);
        },
        unserialize: function(element, serial) {
            (element instanceof $) && (element = element[0]);

            var params = { idx: 0, range: null };

            return (function traverse(element, serial, params) {
                var result = false,
                    started = false,
                    next_idx = 0;

                if (element.nodeType === TT_NODE_TEXT) {
                    started = $.type(params.range) !== 'null';
                    next_idx = params.idx + element.length;
                    
                    if(!started && params.idx <= serial.start && serial.start <= next_idx) {
                        params.range = rangy.createRange();
                        params.range.setStart(element, serial.start - params.idx);
                        started = true;
                    }            
            
                    if(started && params.idx <= serial.end && serial.end <= next_idx) {
                        params.range.setEnd(element, serial.end - params.idx);
                        return params.range;
                    }

                    params.idx = next_idx;
                } else {
                    $(element).contents().each(function(i, child) {
                        return !(result = traverse(child, serial, params));
                    });
                }
                
                return result;
            })(element, serial, params);
        },
        getFrom: function(element) {
            (element instanceof $) && (element = element[0]);
            
            var result = null,
                selection = rangy.getSelection(),
                element_range = rangy.createRange();
            
            element_range.selectNodeContents(element);
            
            if (selection.rangeCount)
                result = selection.getRangeAt(0).intersection(element_range);
            
            element_range.detach();

            return result;    
        },
        getElements: function(range, id) {
            var result = $(),
                nodes = range.getNodes(false, function (element) {
                    return $(element.parentNode).hasClass(getApplierClass(id));
                });
            
            for(var i = 0; i < nodes.length; i++) 
                result = result.add(nodes[i].parentNode);
            
            return result;
        },
        apply: function(range, id) {
            getApplier(id).applyToRange(range);
        },
        clear: function(range, id) {
            getApplier(id).undoToRange(range); 
        },
        equals: function(r1, r2) {
            return (
                r1.startContainer === r2.startContainer
             && r1.endContainer === r2.endContainer
             && r1.startOffset === r2.startOffset
             && r1.endOffset === r2.endOffset
            ); 
        }
    });
    
})(window.tt, window.jQuery);

