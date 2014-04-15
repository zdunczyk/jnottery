// jNottery (c) 2014, Tomasz Zduńczyk <tomasz@zdunczyk.org>
// Released under the MIT license.

(function(tt, $) {
    var str = rayson.type.str,
        raw = rayson.type.raw,
        int8 = rayson.type.int8;

    var TT_ELEMENT = 0;
   
    var merged_notes = {},
        pending_notes = {};
        
    function Note(type, content, params) {
        $.extend(this, {
            type: type,
            content: content,
            params: params
        });
    }

    function getUniqueId() {
        return Array.apply(null, Array(8)).map(function() {
            return (Math.random() * 16 | 0).toString(16);
        }).join('');
    }

    function addElementNote(element, content, params, merged) {
        var unique_id = element.data('ttid'),
            notes = merged ? merged_notes : pending_notes;
        
        if(typeof unique_id === 'undefined') {
            unique_id = getUniqueId();
            element.data('ttid', unique_id);
            element.addClass('ttid-' + unique_id);
        }

        if($.type(notes[unique_id]) !== 'array')
            notes[unique_id] = [];
       
        notes[unique_id].push(new Note(TT_ELEMENT, content, params));
        
        return unique_id;
    }
    
    tt.core = $.extend(tt.core || {}, {
        version: '0.1.0',
        
        // main Note object
        note: Note,
        
        addElementNote: function(element, content, params) {
            return addElementNote(element, content, params, false);
        },
        init: function(options) {
            var hash_decoded,
                elements = [],
                note;
            
            if(window.location.hash !== '') {
                hash_decoded = rayson.b64.decode(window.location.hash.slice(1), Base64.decode);
                
                hash_decoded = rayson.unserialize(hash_decoded, {
                    // version of encoded data
                    version: str,
                    // encoded selectors
                    selectors: [ raw ],
                    // encoded notes
                    notes: [{
                        type: int8,
                        // index from selectors array
                        selector: int8,
                        content: str,
                        params: [ str ]
                    }]
                });
                
                for(var s = 0; s < hash_decoded.selectors.length; s++) {
                    elements.push($.xJQ(hash_decoded.selectors[s]));
                }
                
                for(var n = 0; n < hash_decoded.notes.length; n++) {
                    note = hash_decoded.notes[n];
                    
                    if(note.type === TT_ELEMENT) {
                        addElementNote(
                            elements[note.selector], 
                            note.content, 
                            note.params, 
                            true
                        );
                    }
                }
            }
        },
        merge: function() {
            var selectors = [],
                current_selector,
                notes = [];
            
            if(!$.isEmptyObject(pending_notes)) {
                // merge pending array
                for(var unique_id in pending_notes) {
                    if(typeof merged_notes[unique_id] === 'undefined') 
                        merged_notes[unique_id] = [];
                   
                    merged_notes[unique_id].push.apply(
                        merged_notes[unique_id], 
                        pending_notes[unique_id]
                    );
                } 
                
                for(var unique_id in merged_notes) {
                    if(merged_notes.hasOwnProperty(unique_id)) {
                        current_selector = selectors.push($('.ttid-' + unique_id).xJQ()) - 1;
                        
                        for(var n = 0; n < merged_notes[unique_id].length; n++) {
                            var note = merged_notes[unique_id][n];
                            notes.push({
                                type: note.type,
                                selector: current_selector,
                                content: note.content,
                                params: note.params
                            });
                        }
                    }
                }
                
                window.location.hash = rayson.b64.encode(rayson.serialize({
                    version: tt.core.version,
                    selectors: selectors,
                    notes: notes 
                }, {
                    version: str,
                    selectors: raw,
                    type: int8,
                    selector: int8,
                    content: str,
                    params: str 
                }), Base64.encode);

                return true;
            }

            return false;
        }
    });

})(window.tt, window.jQuery);