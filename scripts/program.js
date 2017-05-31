function bubbleTemplate(type, msgObj) {
    var message = document.createElement("div");
    var bubble  = document.createElement("div");
    var text    = document.createElement("div");
    
    bubble.classList.add("bubble");
    message.classList.add("message");
    text.classList.add("text");
    
    text.innerHTML = msgObj.content;
    
    bubble.appendChild(text);
    message.appendChild(bubble);
    
    switch (type) {
        case "date":
            message.classList.add("date");
            message.classList.add("new");
            var date = msgObj.date.split("/");
            var months  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var month   = months[parseInt(date[0], 10) - 1];
            var day     = date[1];
            var year    = "20" + date[2];
            text.innerText = month + " " + day + ", " + year;
            break;
        case "system":
            message.classList.add("system");
            break;
        default:
            var time = document.createElement("div");
            time.classList.add("time");
            bubble.appendChild(time);
            time.innerText = msgObj.time;
            break;
    }
    return message;
}
    
function escapeHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function loadMessages(messagesArray, contactName) {
    $("#chat").html("");
    
    var previousMessage = null;
    var currentMessage  = null;
    var previousDate    = null;
    var currentDate     = null;
    
    for (var i = 0; i < messagesArray.length; i++) {
        currentMessage = messagesArray[i];
        currentDate    = currentMessage.date;
        
        if (!previousMessage) {
            previousMessage = currentMessage;
        }
        if (!previousDate) {
            previousDate = currentDate;
        }
        
        var type = "";
        if (!currentMessage.sender) {
            type = "system";
        }
        
        var dateElement = null;
        if (currentDate != previousDate) {
            dateElement = bubbleTemplate("date", currentMessage);
            $("#chat").append(dateElement);
        }
        
        var messageElement = bubbleTemplate(type, currentMessage);
        
        if (currentMessage.sender && currentMessage.sender != contactName) {
            messageElement.classList.add("sent");
        }
        
        if (previousMessage.sender && previousMessage.sender != currentMessage.sender) {
            messageElement.classList.add("new");
        }
        if (dateElement) {
            messageElement.classList.add("new");
        }
        
        previousMessage = currentMessage;
        previousDate    = currentDate;
        $("#chat").append(messageElement);
    }
    fixTimePositions();
}

function parseMessages(messageStrings, contactName) {
    var messages = [];
    for (var i = 0; i < messageStrings.length; i++) {
        var text = messageStrings[i];
        var message = {};
        var capture;
        if (capture = text.match(/(\d+\/\d+\/\d+), (\d+\:\d+ AM|\d+\:\d+ PM) - (.*)\: (.*)/)) {
            message.date    = capture[1];
            message.time    = capture[2];
            message.sender  = capture[3];
            message.content = escapeHTML(capture[4]);
            if (message.content == "") {
                message.content = "&nbsp;"; 
            }
            var url = null;
            if (url = message.content.match(/https*\:\/\/.*\.com\/.*\s*/)) {
                var link = document.createElement("a");
                link.href = url[0];
                link.innerText = url[0];
                message.content = message.content.replace(url, link.outerHTML);
            }
        }
        else if (capture = text.match(/(\d+\/\d+\/\d+), (\d+\:\d+ AM|\d+\:\d+ PM) - (.*)/)) {
            message.date    = capture[1];
            message.time    = capture[2];
            message.content = capture[3];
        }
        if (capture) {
            messages.push(message);
        }
    }
    return messages;
}

function fixTimePositions() {
    $(".message").each(function () {
        if ($(this).find(".time").length) {
            var $bubbleElem = $(this).find(".bubble");
            var bubbleElem  = $bubbleElem[0];
            
            var time        = { text : $(this).find(".time").text() };
            time.width      = measureTextWidth(time.text, "11px 'Open Sans'");
            time.marginLeft = time.width * 0.25;
            time.marginTop  = parseInt($bubbleElem.css("font-size"), 10) * 1.25;
            
            var bubble          = { contentWidth : 257 };
            bubble.allowedWidth = bubble.contentWidth - (time.width + time.marginLeft);
            
            if (bubbleElem.clientWidth < bubble.allowedWidth) {
                bubbleElem.style.width = bubbleElem.clientWidth + time.width + time.marginLeft + "px";
            } else {
                var text = $(this).find(".text").text();
                var table = calcTextRows(text, bubble.contentWidth, "13px 'Open Sans'");
                
                var tempContentWidth = table.lastRow.width + (time.width + time.marginLeft);
                
                if (table.rows.length == 1) {
                    if (tempContentWidth > bubble.allowedWidth) {
                        bubbleElem.style.height = $bubbleElem.outerHeight() + time.marginTop + "px";
                    }
                }
                else if (table.rows.length > 1) {
                    if (tempContentWidth > bubble.contentWidth) {
                        bubbleElem.style.height = $bubbleElem.outerHeight() + time.marginTop + "px";
                    }
                }
            }
        }
    });
}