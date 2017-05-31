function measureTextWidth(text, font, through) {
    var canvas   = document.createElement("canvas");
    var context  = canvas.getContext("2d");
    context.font = font;
    if (through) {
        var chars = text.split("");
        var width = 0;
        for (var i = 0; i < chars.length; i++) {
            width += parseFloat( (context.measureText(chars[i]).width).toFixed(2) );
        }
        return width;
    }
    return context.measureText(text).width;
}

function calcTextRows(text, containerWidth, font, through) {
    var words = text.split(" ");
    
    var table = {
        rows  : [],
    };
    
    var row = [];
    var rowWidth = 0;
    var spaceWidth = measureTextWidth(" ", font, through);
    
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var wordWidth = measureTextWidth(word, font, through);
        
        function newRow() {
            table.rows.push({
                text  : row.slice().join(" "),
                width : rowWidth + spaceWidth,
            });
            row      = [];
            rowWidth = 0;
        }
            
        if (rowWidth + wordWidth <= containerWidth) {
            rowWidth += wordWidth + spaceWidth;
            row.push(words[i]);
        }
        else if (rowWidth + wordWidth > containerWidth) {
            newRow();
            rowWidth += wordWidth + spaceWidth;
            row.push(words[i]);
        }
        
        if (i == (words.length - 1)) {
            newRow();
        }
    }
    
    var maxWidth = 0;
    table.widestRow = null;
    for (var i = 0; i < table.rows.length; i++) {
        if (table.rows[i].width > maxWidth) {
            maxWidth = table.rows[i].width;
            table.widestRow = table.rows[i];
        }
    }
    
    table.lastRow = table.rows[table.rows.length - 1];
    
    return table;
}