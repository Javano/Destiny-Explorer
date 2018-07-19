

var version = "1.4";
var datestamp = "April 10th, 2018";

var DIRECTIONS = ['↑', '→', '↓', '←'];
var OFFSETS = [
    [1, 1, 1],
    [1, 2, 1, 1],
    [2, 1, 1, 2],
    [1, 3, 1, 2]
];
var currOffset = [1, 1, 1, 1];
var currDirections = [1, 1, 1, 1];

$(document).ready(function () {
    //Update version label 
    $("#versionNum").text('v' + version).attr("title", datestamp).tooltip();

    setTimeout(function () {
        doneLoading();
    }, 1000);


});


function doTurn4(id) {
    if (id > 0) {
        turn(id - 1);
    }
    turn(id);
    if (id < 3) {
        turn(id + 1);
    }
}
function doTurn3(id) {
    if (id > 0) {
        turn(id - 1);
    }
    turn(id);
    if (id < 2) {
        turn(id + 1);
    }
}
function turn(id) {
    currDirections[id] = (parseInt(currDirections[id]) + currOffset[id]) % 4;
}

function turnBtn(id) {
    var btn = $('#btn' + id);

    var btnVal = parseInt($('#btn' + id).attr("data-val"));

    var newVal = (parseInt(btnVal) + 1) % 4;

    $(btn).text(DIRECTIONS[newVal]);
    $(btn).attr("data-val", newVal);
}
function solve(puzzleID) {
    var valid = true;
    $("#outputTxt").html("");

    currOffset = OFFSETS[puzzleID - 1];

    $('.numBtn').each(function (i, v) {
        $(v).attr("data-orig-val", $(v).attr("data-val"));
        currDirections[i] = parseInt($(v).attr("data-val"));
        if (currOffset[i] == 2 && (currDirections[i] == 1 || currDirections[i] == 3)) {
            valid = false;
        }
    });
    if (puzzleID == 1) {
        var turnsA = 0;
        while (currDirections[1] != currDirections[2]) {
            doTurn3(0);
            turnsA++;
        }
        if (turnsA > 0) {
            $("#outputTxt").append("<p>Turn A " + turnsA + "x</p>");
        }
        var turnsC = 0;
        while (currDirections[0] != currDirections[1]) {
            doTurn3(2);
            turnsC++;
        }
        if (turnsC > 0) {
            $("#outputTxt").append("<p>Turn C " + turnsC + "x</p>");
        }
        var turnsB = 0;
        while (currDirections[1] != 2) {
            doTurn3(1);
            turnsB++;
        }
        if (turnsB > 0) {
            $("#outputTxt").append("<p>Turn B " + turnsB + "x</p>");
        }
    } else {
        if (valid) {

            var turnsC = 0;

            var dist0 = getRotDistance(currDirections[0], currOffset[0]);
            var dist1 = getRotDistance(currDirections[1], currOffset[1]);

            while (dist0 != dist1) {
                if ((dist0 != dist1) && ((currOffset[0] == 2 && (dist1 % 2) == dist0) || (currOffset[1] == 2 && (dist0 % 2) == dist1))) {
                    break;
                } else {
                    doTurn4(2);
                    turnsC++;
                    dist0 = getRotDistance(currDirections[0], currOffset[0]);
                    dist1 = getRotDistance(currDirections[1], currOffset[1]);
                }

            }
            if (turnsC > 0) {
                $("#outputTxt").append("<p>Turn C " + turnsC + "x</p>");
            }
            var turnsB = 0;

            var dist2 = getRotDistance(currDirections[2], currOffset[2]);
            var dist3 = getRotDistance(currDirections[3], currOffset[3]);

            while (dist2 != dist3) {
                if ((dist2 != dist3) && ((currOffset[2] == 2 && (dist3 % 2) == dist2) || (currOffset[3] == 2 && (dist2 % 2) == dist3))) {
                    break;
                } else {
                    doTurn4(1);
                    turnsB++;
                    dist2 = getRotDistance(currDirections[2], currOffset[2]);
                    dist3 = getRotDistance(currDirections[3], currOffset[3]);
                }

            }

            if (turnsB > 0) {
                $("#outputTxt").append("<p>Turn B " + turnsB + "x</p>");
            }

            var turnsA = 0;
            while (currDirections[0] != 2 || currDirections[1] != 2) {
                doTurn4(0);
                turnsA++;
            }

            if (turnsA > 0) {
                $("#outputTxt").append("<p>Turn A " + turnsA + "x</p>");
            }

            var turnsD = 0;
            while (currDirections[2] != 2 || currDirections[3] != 2) {
                doTurn4(3);
                turnsD++;
            }

            if (turnsD > 0) {
                $("#outputTxt").append("<p>Turn D " + turnsD + "x</p>");
            }


            $('.numBtn').each(function (i, v) {
                $(v).attr("data-val", $(v).attr("data-orig-val"));
                $(v).text(DIRECTIONS[$(v).attr("data-val")]);
            });
        } else {

            $("#outputTxt").html("<p class='error'>Invalid Input!</p>");
        }
    }
}
function getRotDistance(direction, offset) {
    var endDir = 2;
    var rotations = 0;
    while (((offset * rotations) + direction) % 4 != 2) {
        rotations++;
        if (rotations > 5) {
            rotations = -1;
            break;
        }
    }

    return rotations;
}
$('.numBtn').on('click', function () {

    var btnID = parseInt($(this).attr("data-id"));
    turnBtn(btnID);
});


$('.offBtn').on('click', function () {

    var btnID = parseInt($(this).attr("data-id"));
    turnOffset(btnID);
});

$('.btnWall').on('click', function () {

    var wallNum = parseInt($(this).attr("data-wall-num"));
    $("#solveBtn").attr("onclick", "solve(" + wallNum + ");");
    if (wallNum == 1) {
        $("#btn3").fadeOut();
    } else {
        $("#btn3").fadeIn();
    }
});


function turnOffset(id) {
    var btn = $('#off' + id);

    var newVal = ((parseInt($('#off' + id).attr("data-val")) + 1) % 3) + 1;

    $(btn).text(newVal);
    $(btn).attr("data-val", newVal);
}



function doneLoading() {
    loading = false;


    $('#loadingPanel').fadeOut(400, function () {
        $('#sidebar, #content').toggleClass('active');
        $('#sidebar').show();

        $('#userBar').slideDown();
        $('#sidebarCollapse').fadeIn();
        $('#loadedContentPanel').slideDown();

        $('#xurBtn').slideDown();
    });
}

var ascii = /^[a-zA-Z0-9_ \.\,\-]+$/;

var alphabetStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var alphabet = alphabetStr.split('');

function solveCipher(cipherTxt) {
    //CAESAR + BASE64
    for (var i = 0; i < 64; i++) {
        var newStr = "";
        for (var c = 0; c < cipherTxt.length; c++) {
            var cOffset = getOffset(cipherTxt.charAt(c));
            cOffset++;
            if (cOffset > 63) {
                cOffset -= 64;
            }
            newStr += getChar(cOffset);
        }
        cipherTxt = newStr;
        var resStr = atob(cipherTxt);
        if (ascii.test(resStr)) {
            console.log(`[${i}] - ${resStr}`);
        }
    }
}

function solveCipher2(cipherTxt) {

    var maxNum;
    var maxNumStr = "";
    for (var i = 0; i < cipherTxt.length; i++) {
        maxNumStr += "1";
    }
    var maxNum = bin2dec(maxNumStr);
    console.log(maxNumStr);
    console.log("Max Num: " + maxNum);

    var currNum = 0;

    while (currNum <= maxNum) {
        var newStr = "";
        var bin = dec2bin(currNum);

        while (bin.length < cipherTxt.length) {
            bin = "0" + bin;
        }

        for (var i = 0; i < cipherTxt.length; i++) {
            if (bin.charAt(i) == '1') {
                newStr += cipherTxt.charAt(i).toLowerCase();
            } else {
                newStr += cipherTxt.charAt(i);
            }
        }
        solveCipher(newStr);
        console.log('-------------------');
        currNum++;
    }
}
function getOffset(char) {
    var offset = -1;
    for (var i = 0; i < alphabet.length; i++) {
        if (char == alphabet[i]) {
            offset = i;
        }
    }
    return offset;
}


function getChar(offset) {
    return alphabet[offset];
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function bin2dec(bin) {
    return parseInt(bin, 2);
}