const reducer = (accumulator, currentValue) => accumulator + currentValue;

var projectDls = new Map();
var updateIndex = 0;
var projects = null;
var secondsLeft = 600;
getData("pages.json", updateAllProjectDownloads)
setInterval(function() {
    if (secondsLeft < 0) {
        resetTime();
    }
    secondsLeft--;
    updateTime();
}, 1000);

function updateAllProjectDownloads(xmlHttpResponse) {
    projects = JSON.parse(xmlHttpResponse).projects;
    for (var listIndex in projects) {
        var targetPage = projects[listIndex].toString();
        $.get(targetPage, result(listIndex, false));
    }
    setInterval(updateAProjectDownload, 20000);
}

function resetTime() {
    secondsLeft = 600;
    updateTime();
}

function updateTime() {
    var minutes = (secondsLeft / 60) | 0;
    var seconds = (secondsLeft % 60);
    $('#time').html("Estimated " + minutes + "m " + seconds + "s until next update");
}

function updateAProjectDownload(xmlHttpResponse) {
    var targetPage = projects[updateIndex].toString();
    $.get(targetPage, result(updateIndex, true));
    if (updateIndex < projects.length - 1) {
        updateIndex++;
    } else {
        updateIndex = 0;
    }
}

function result(index, update) {
    return function(data, status, jqXHR) {
        index = parseInt(index);
        var downloads_html = $('div.w-full:nth-child(4) > span:nth-child(2)', $(data)).html();
        var downloads = parseInt(downloads_html.toString().replace(/,/g, ""));
        if (!projectDls.has(index) ^ projectDls.get(index) < downloads) {
            if (projectDls.get(index) < downloads && secondsLeft < 550) {
                getData("pages.json", updateAllProjectDownloads);
                resetTime();
            }
            projectDls.set(index, downloads);
        }
        if (index == projects.length && !update) {
            updateCounter();
        } else {
            updateCounter();
        }
    }
}

function updateCounter() {
    var value = Array.from(projectDls.values()).reduce(reducer);
    $('#main-counter').html(value.toString());
}

function getData(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.overrideMimeType("application/json");
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}