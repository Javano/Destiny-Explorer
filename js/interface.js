

var version = "1.05";
var datestamp = "May 2nd, 2018";

var d2API;
var d2DB;

var API_CONFIG = {
    apikey: `179275df5e5847ad8797e18756417505`,
    oauthConfig: {
        id: `21640`,
        secret: `ncyNDQEF09DKw.BI01jIdlAtobB1Cz8EXX1gxzjiPQ8`
    }
};

var CLASS_ENUM = [`Titan`, `Hunter`, `Warlock`, `Any`];
var GENDER_ENUM = [`Male`, `Female`, `Unknown`];
var RACE_ENUM = [`Human`, `Awoken`, `Exo`, `Unknown`];

var BLIZ_ICON_URL = `img/platform/icon_bliz.png`;
var XBOX_ICON_URL = `img/platform/icon_xbl.png`;
var PSN_ICON_URL = `img/platform/icon_psn.png`;
var PLAT_NAMES = ["", "Xbox One", "PS4", "", "PC"];
var PLAT_ICONS = ["", XBOX_ICON_URL, PSN_ICON_URL, "", BLIZ_ICON_URL];
var PLATS = ["XB1", "PS4", "0", "PC"];

var XUR_LOCATIONS = { "EDZ": 3143798436, "Nessus": 3966792859, "Titan": 4166562681, "Io": 4159221189 };
var FLASHPOINT_QUEST_HASHES = { 2144675440: "EDZ", 1268260813: "Mars", 2878046419: "Mercury" };
var ajaxDelay = 30;
var loading = true;

var resetGMTHour = 17; // DST == True
//var resetGMTHour = 18; // DST == False

var loadGMT;
var loadTime;
var resetDay;

var myXurItems = [];

var xurOverrideStr = { "name": "Xur", "isLive": true, "itemHashes": [759381183, 4285666432, 419976108, 3790373075, 2954558333, 2286143274], "location": { "planet": "EDZ", "region": "Winding Cove" }, "flashpointQuestHash": 2878046419 };
var xurOverride = false;

setBG();

$(document).ready(function () {
    //Update version label 
    $("#versionNum").text(`v${version}`).attr("title", datestamp).tooltip();

    enforceDomain();
    checkIE();
    initTime();
    initXur();
    initAPIClient();
    initFaves();
    initBnetAuth();
    initListeners();
    initSidebar();


});

function makeXurString() {
    var xurStr = `{"name":"Xur","isLive":true,"itemHashes":[`;
    for (var i = 0; i < myXurItems.length; i++) {
        xurStr += myXurItems[i].hash;
        if (i < myXurItems.length - 1) {
            xurStr += ",";
        }
    }
    xurStr += `],"location":{"planet":"PLANET","region":"REGION"}}`;
    console.log(xurStr);
}
function checkIE() {
    console.log("Is IE?: " + msieversion());
}
function initSidebar() {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        $('#sidebarCollapse').toggle();
    });

    $('#sidebar .close').on('click', function () {
        $('#sidebarCollapse').click();
    });
}

function initXur() {

    var GMT = getGMT();
    var tuesday = GMT.getUTCDate() - GMT.getUTCDay() + 2;

    if (GMT.getUTCDay() < 2 || (GMT.getUTCDay() == 2 && GMT.getUTCHours() < resetGMTHour)) {
        tuesday -= 7;
    }

    resetDay = new Date(Date.UTC(GMT.getUTCFullYear(), GMT.getUTCMonth(), tuesday, resetGMTHour, 0, 0, 0));
    xurDay = new Date(Date.UTC(GMT.getUTCFullYear(), GMT.getUTCMonth(), tuesday + 3, resetGMTHour, 0, 0, 0));

    var xurCount = setInterval(function () {

        var xurCount_Distance = xurDay - getGMT();

        var xurCount_Days = Math.floor(xurCount_Distance / (1000 * 60 * 60 * 24));
        var xurCount_Hours = Math.floor((xurCount_Distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var xurCount_Mins = Math.floor((xurCount_Distance % (1000 * 60 * 60)) / (1000 * 60));
        var xurCount_Secs = Math.floor((xurCount_Distance % (1000 * 60)) / 1000);

        if (xurCount_Distance <= 0) {
            clearInterval(xurCount);
            $(`#xurBtn`).text('');
            checkForXur();

            $('#xurBtn').on('click', function () {
                checkForXur(true);
            });

        } else if (xurCount_Days >= 1) {
            $(`#xurBtn`).text(`${xurCount_Days} day${(xurCount_Days >= 2 ? 's' : '')}`);
        } else {
            $(`#xurBtn`).text(`${xurCount_Hours}:${(xurCount_Mins >= 10 ? '' : '0') + xurCount_Mins}:${(xurCount_Secs >= 10 ? '' : '0') + xurCount_Secs}`);
        }
    }, 1000);


    $(`#xurBtn`).attr("title", "Xur");
    $(`#xurBtn`).tooltip();
}

function initAPIClient() {
    d2API = new Destiny2API({
        key: API_CONFIG.apikey,
        oauthConfig: API_CONFIG.oauthConfig
    });

    d2DB = new D2Database(function (response) {
        doneLoading();
    });
}

function initTime() {
    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);

    loadGMT = new Date(req.getResponseHeader("Date"));
    loadTime = new Date();
}

function getGMT() {
    var currTime = new Date();
    var offset = currTime - loadTime;
    return new Date(loadGMT.getTime() + offset);
}

function doneLoading() {
    loading = false;

    $("#ClanSubmitBtn").removeClass("disabled").text("Search");
    $("#UserSubmitBtn").removeClass("disabled").text("Search");

    $('#loadingPanel').fadeOut(400, function () {
        $('#sidebar, #content').toggleClass('active');
        $('#sidebar').show();

        $('#userBar').slideDown();
        $('#sidebarCollapse').fadeIn();
        $('#loadedContentPanel').slideDown();

        $('#xurBtn').slideDown();
    });
}

function checkForXur(force = false) {
    if (xurOverride) {
        displayXur(xurOverrideStr, force);
        $('#xurBtn').removeClass(`xur-inactive`);
    } else {
        d2API.getXur(function (response) {
            if (response.isLive) {
                displayXur(response, force);
                $('#xurBtn').removeClass(`xur-inactive`);
            }
        });

    }
}

function loadHistory(membershipType, membershipId, charIDs, statsElementID) {
    if (!$(statsElementID).attr(`data-loaded`)) {
        charIDs = JSON.parse(charIDs);
        var activityHists = [];
        var reqError = null;
        $.each(charIDs, function (index, value) {
            var req = d2API.getActivityHistory(membershipType, membershipId, value);
            if (req.ErrorCode == "1") {
                activityHists.push(req.Response);
                d2API.getVendor(membershipType, membershipId, value, 2190858386, function (response) {
                    console.dir(response);
                });
            } else {
                reqError = req.Message;
            } reqError
        });

        if (!reqError) {
            var userHTML = "";
            $.each(activityHists[0].activities, function (activityIndex, value) {



                userHTML += `<tr>`;
                $.each(activityHists, function (index, value) {
                    userHTML += `<td scope="row">`;
                    if (value.activities && value.activities[activityIndex]) {
                        value = value.activities[activityIndex];
                        var hashDetails = d2DB.lookupActivity(value.activityDetails.directorActivityHash)[0];

                        if (hashDetails) {
                            var activityName = hashDetails.displayProperties.name;
                            if (activityName) {
                                var lightLevel = hashDetails.activityLightLevel;
                                var activityLevel = hashDetails.activityLevel;
                                var completed = value.values.completed.basic.value;
                                var date = new Date(value.period);
                                var duration = value.values.activityDurationSeconds.basic.value;
                                var endDate = new Date(date.getTime() + (duration * 1000));
                                var pgcrImage = hashDetails.pgcrImage;
                                userHTML += `<div class="activity-container" data-activity-hash="${value.activityDetails.directorActivityHash}" style="background-image: url(https://www.bungie.net${pgcrImage});" onclick='console.log("Activity Details:");console.dir(${JSON.stringify(value)});'>`;
                                if (hashDetails.displayProperties.hasIcon) {
                                    var icon = hashDetails.displayProperties.icon;
                                    userHTML += `<img src="https://www.bungie.net${icon}" class="activity-icon" />`;
                                }
                                if (completed) {
                                    userHTML += `<span class='activity-name complete' title='Completed Activity'>`;
                                } else {
                                    userHTML += `<span class='activity-name incomplete'>`;
                                }

                                userHTML += activityName + `</span>`;
                                if (lightLevel != 10) {
                                    userHTML += `<span class='activity-light light-level'>${lightLevel}</span>`;
                                }
                                userHTML += `<span class='activity-time'>${date.toLocaleString()}</span>`;



                                userHTML += `</div>`;
                            }
                        }
                        userHTML += `</td>`;
                    }

                });
                userHTML += `</tr>`;

            });
        } else {
            $("#modalError .error-title").text("Bungie API Error")
            $("#modalError .error-msg").text(`${reqError}`);
            $("#modalError").modal();
        }
    }

    $(statsElementID).find(`tbody`).append(userHTML);
    $(statsElementID).attr(`data-loaded`, true);
}

async function renderClanMemberStats(container, members) {

    if (members && members.length) {

        var m = members.shift();

        var row = $(container).find(`#tr-${m.destinyUserInfo.membershipId}`);

        $(row).append(`<td class="loading"><img class="loading-icon" src="img/Eclipse.svg"/></td>`);

        setTimeout(function () {
            d2API.getProfile(m.destinyUserInfo.membershipType, m.destinyUserInfo.membershipId, function (response) {
                var profile = response.Response;
                if (profile) {

                    fetchPlayerPoints(profile, function (response) {
                        var lastPlayedDate = new Date(profile.profile.data.dateLastPlayed);
                        var now = new Date();
                        var daysSinceLogin = numDaysBetween(lastPlayedDate, now);
                        var active = false;
                        $(row).attr("data-daysSinceLogin", daysSinceLogin);

                        if (lastPlayedDate >= resetDay) {
                            active = true;
                            $(row).addClass("activeSince-reset");
                        } else if (daysSinceLogin < 7) {
                            $(row).addClass("activeSince-lastWeek");
                        } else if (daysSinceLogin < 31) {
                            $(row).addClass("activeSince-lastMonth");
                        } else {
                            $(row).addClass("activeSince-inactive");
                        }
                        var points = response;
                        $(row).find("td.loading").remove();
                        $(row).append(
                            `<td data-val="${points.total}">${parseInt(points.total).toLocaleString()}</td>` +
                            `<td data-val="${points.pve}">${parseInt(points.pve).toLocaleString()}</td>` +
                            `<td data-val="${points.pvp}">${parseInt(points.pvp).toLocaleString()}</td>` +
                            `<td data-val="${profile.profile.data.dateLastPlayed}">${lastPlayedDate.toLocaleString()}</td>`);
                    });

                } else {
                    $(row).find("td.loading").remove();
                    $(row).append(
                        `<td data-val="0">N/A</td>` +
                        `<td data-val="0">N/A</td>` +
                        `<td data-val="0">N/A</td>` +
                        `<td data-val="0">N/A</td>`);
                }

                var increment = parseFloat($(".clanStatsBar div.progress-bar").attr("data-increment"));
                var progress = parseFloat($(".clanStatsBar div.progress-bar").attr("data-progress"));
                $(".clanStatsBar div.progress-bar").attr("data-progress", progress + increment);
                //$(".clanStatsBar div.progress-bar").text(`${parseInt(progress + increment)}%`);
                $(".clanStatsBar div.progress-bar").css("width", `${progress + increment}%`);

            }, "Profiles");
        }, ajaxDelay);

        setTimeout(function () {
            renderClanMemberStats(container, members);
        }, ajaxDelay);
    } else {
        $(".clanStatsBar div.progress").slideUp();
        $(".clanStatsBar img.clanLoadSpinner").fadeOut();
        var activeSinceResetCount = $("tr.activeSince-reset").length;
        var activeSinceLastWeekCount = $("tr.activeSince-lastWeek").length + activeSinceResetCount;
        var activeSinceLastMonthCount = $("tr.activeSince-lastMonth").length + activeSinceLastWeekCount;
        var inactiveCount = $("tr.activeSince-inactive").length;
        var totalCount = (activeSinceLastMonthCount + inactiveCount);
        $(".clanStatsBar").append(
            `<a href="#!" class="clanFilter" onclick="filterClan('activeSince-reset');"><h5 class="clanStatCount activeSince-reset" style="margin-left: 0px;">Active Since Reset: ${activeSinceResetCount}/${totalCount} (${Math.round(activeSinceResetCount / totalCount * 100)}%)</h5></a>` +
            `<a href="#!" class="clanFilter" onclick="filterClan('activeSince-lastWeek');"><h5 class="clanStatCount activeSince-lastWeek">Active This Week: ${activeSinceLastWeekCount}/${totalCount} (${Math.round(activeSinceLastWeekCount / totalCount * 100)}%)</h5></a>` +
            `<a href="#!" class="clanFilter" onclick="filterClan('activeSince-lastMonth');"><h5 class="clanStatCount activeSince-lastMonth" >Active This Month: ${activeSinceLastMonthCount}/${totalCount} (${Math.round(activeSinceLastMonthCount / totalCount * 100)}%)</h5></a>` +
            `<a href="#!" class="clanFilter" onclick="filterClan('activeSince-inactive');"><h5 class="clanStatCount activeSince-inactive">Inactive: ${inactiveCount}/${totalCount} (${Math.round(inactiveCount / totalCount * 100)}%)</h5></a>`
        );
        $("#ClanSubmitBtn").removeClass("disabled");
        $("#ClanSubmitBtn").text("Search");
    }
}

function filterClan(type) {
    $(`#tblStatsCon tr.${type}`).toggle();
    $(`.clanStatsBar h5.${type}`).toggleClass(`strike`);
}
function lookupPlayer(membershipType, membershipId, silent = false, replaceID = null) {
    if (!loading) {
        if (!silent) {
            $("#UserSubmitBtn").addClass("disabled");
            $("#UserSubmitBtn").text("Loading...");
        }
        setTimeout(function () {


            d2API.getProfile(membershipType, membershipId, function (response) {


                if (response.ErrorCode == 1) {

                    /*****
                    d2API.awaInitializeRequest(function(response2){
                        console.dir(response2);
                    });
                    ** */
                    var profile = response.Response;
                    if (profile) {
                        if (profile.profile.data.userInfo) {
                            fetchPlayerStats(profile, function (response) {
                                var playerStats = response;
                                var charIDs = profile.profile.data.characterIds;

                                d2API.getMembershipsById(membershipType, membershipId, function (respMemberships) {
                                    d2API.getGroupsForMember(profile.profile.data.userInfo.membershipType, profile.profile.data.userInfo.membershipId, 0, 1, function (response) {
                                        var groups = response.Response;
                                        var clan;
                                        var clanID;
                                        var clanName;
                                        if (groups.results.length > 0) {
                                            clan = groups.results[0];
                                            if (clan) {
                                                clanID = clan.group.groupId;
                                                clanName = clan.group.name;
                                            }
                                        }

                                        var containerID = getHTMLID(profile.profile.data.userInfo.displayName);
                                        var counter = 1;
                                        while ($(`#${containerID}_${counter}`).length > 0) {
                                            counter++;
                                        }

                                        var elementID = `${containerID}_${counter}`;


                                        var userHTML = ``;

                                        userHTML += `<div id='${elementID}' class='card panel contentContainer userPanel' style='display:none;margin-bottom: 40px;'>` +
                                            `<div class="texturedPanel glass"></div>` +
                                            `<div class='card-block row'>` +
                                            `<h2 style='width:99%;margin-left: 10px;'>`;

                                        if (respMemberships.Response && respMemberships.Response.destinyMemberships) {
                                            for (var m = 0; m < respMemberships.Response.destinyMemberships.length; m++) {
                                                var membership = respMemberships.Response.destinyMemberships[m];

                                                if (profile.profile.data.userInfo.membershipType == membership.membershipType) {
                                                    userHTML += `<a href="#!" ><img class='${membership.membershipType == 4 ? "blizIcon platIcon" : "platIcon"}' src='${PLAT_ICONS[membership.membershipType]}'  title="${PLAT_NAMES[membership.membershipType]}" style="margin-right:3px" data-toggle="tooltip" data-placement="top"/></a> `;
                                                } else {
                                                    userHTML += `<a href="#!" onclick='lookupPlayer("${membership.membershipType}","${membership.membershipId}", true, "${elementID}");'><img class='${membership.membershipType == 4 ? "blizIcon platIcon" : "platIcon"} platIcon-inactive' src='${PLAT_ICONS[membership.membershipType]}'  title="${PLAT_NAMES[membership.membershipType]}" style="margin-right:3px" data-toggle="tooltip" data-placement="top"/> </a>`;
                                                }

                                            }
                                        }
                                        console.dir(profile.profile);
                                        userHTML += `<span>${profile.profile.data.userInfo.displayName} - ${playerStats.points.total.toLocaleString()} Points</span>`;

                                        if (hasFav(profile.profile.data.userInfo.displayName, profile.profile.data.userInfo.membershipType)) {
                                            userHTML += `<a class='btn btn-lg btn-outline-secondary favBtn faved' href='#!' onmousedown='favUser("${profile.profile.data.userInfo.displayName}","${profile.profile.data.userInfo.membershipType}","${profile.profile.data.userInfo.membershipId}"); toggleFavBtn(this);' title='Unfavorite User'  data-toggle="tooltip" data-placement="top"><i class="fa fa-star-o" aria-hidden="true"></i></a>`;
                                        } else {

                                            userHTML += `<a class='btn btn-lg btn-outline-secondary favBtn' href='#!' onmousedown='favUser("${profile.profile.data.userInfo.displayName}","${profile.profile.data.userInfo.membershipType}","${profile.profile.data.userInfo.membershipId}"); toggleFavBtn(this);'  title='Favorite User'  data-toggle="tooltip" data-placement="top"><i class="fa fa-star-o" aria-hidden="true"></i></a>`;
                                        }
                                        userHTML += `<a href='#!' class='close' aria-label='Close'  style='position: absolute;top: 15px;right: 20px;' onclick='closeCard("${elementID}");'>&times;</a></h2>` +
                                            `</div>` +
                                            `<div class='card-block row'>` +
                                            `<ul id='${elementID}-nav' class='nav nav-tabs user-nav' role='tablist'>` +
                                            `<li class='nav-item'><a class='nav-link active' href='#${elementID}-home' id='${elementID}-home-tab' role='tab' data-toggle='tab' aria-controls='${elementID}-home' aria-expanded='true'>Overview</a></li>` +
                                            `<li class='nav-item'><a class='nav-link' href='#${elementID}-pvp' role='tab' data-toggle='tab' aria-controls='${elementID}-pvp'>PvP</a></li>` +
                                            `<li class='nav-item'><a class='nav-link' href='#${elementID}-pve' role='tab' data-toggle='tab' aria-controls='${elementID}-pve'>PvE</a></li>` +
                                            `<li class='nav-item'><a class='nav-link' href='#${elementID}-raids' role='tab' data-toggle='tab' aria-controls='${elementID}-raids'>Raids</a></li>` +
                                            `<li class='nav-item'><a class='nav-link' href='#${elementID}-chars' role='tab' data-toggle='tab' aria-controls='${elementID}-chars'>Characters</a></li>` +
                                            `<li class='nav-item'><a class='nav-link' href='#${elementID}-hist' role='tab' data-toggle='tab' aria-controls='${elementID}-hist' onclick=loadHistory("${profile.profile.data.userInfo.membershipType}","${profile.profile.data.userInfo.membershipId}",'${JSON.stringify(charIDs)}',"#${elementID}-hist");>History</a></li>` +
                                            `</ul>` +
                                            `</div>` +
                                            `<div class='card-block row'>` +
                                            `<div id='${elementID}-nav-content' class='tab-content'>` +

                                            `<div role='tabpanel' class='tab-pane fade show active' id='${elementID}-home' aria-labelledby='${elementID}-home-tab'></div>` +

                                            `<div role='tabpanel' class='tab-pane fade' id='${elementID}-pve' aria-labelledby='${elementID}-pve-tab'></div>` +

                                            `<div role='tabpanel' class='tab-pane fade' id='${elementID}-raids' aria-labelledby='${elementID}-raids-tab'></div>` +

                                            `<div role='tabpanel' class='tab-pane fade' id='${elementID}-pvp' aria-labelledby='${elementID}-pvp-tab'></div>` +

                                            `<div role='tabpanel' class='tab-pane fade' id='${elementID}-chars' aria-labelledby='${elementID}-chars-tab'></div>` +

                                            `<div role='tabpanel' class='tab-pane fade' id='${elementID}-hist' aria-labelledby='${elementID}-hist-tab'></div>` +

                                            `</div></div>`;

                                        if (replaceID) {
                                            $(".tooltip").tooltip("hide");
                                            $(`#${replaceID}`).fadeOut();
                                            document.getElementById(replaceID).outerHTML = userHTML;
                                            $(`#${containerID}_${counter}`).fadeIn();
                                        } else {
                                            $(`#userSearchResults`).prepend(userHTML);
                                            $(`#userSearchResults`).show();
                                            $(`#${containerID}_${counter}`).slideDown();
                                        }
                                        //Load Overview Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-home`);
                                            var contentHTML = ``;

                                            contentHTML += `<div class='card-block row'>` +
                                                `<div id='points_panel_pve' class='panel col'>` +
                                                `<h4>PvE -  ${playerStats.points.pve.toLocaleString()} Points [${playerStats.pve.time}]</h4>` +
                                                `<table class='table'><thead>` +
                                                `</thead><tbody>` +
                                                `<tr>` +
                                                `<th scope='row'>Raids (Normal):</th>` +
                                                `<td>${playerStats.raid.normal_comps.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Raids (Prestige): </th>` +
                                                `<td>${playerStats.raid.hard_comps.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Nightfalls:</th>` +
                                                `<td>${playerStats.nf.comps.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Strikes:</th>` +
                                                `<td>${playerStats.strike.comps.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Normal Events:</th>` +
                                                `<td>${playerStats.pve.public_events.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Heroic Events:</th>` +
                                                `<td>${playerStats.pve.heroic_events.toLocaleString()}</td>` +
                                                `</tr>` +
                                                `</tbody></table>`;


                                            if (clan) {
                                                contentHTML += `<br/>Clan: <a href='#!' onclick='lookupClan("${clanName}", true);'>${clanName}</a><br/>`;
                                            }
                                            contentHTML += `</div>` +
                                                `<div id='points_panel_pvp' class='panel col'>` +

                                                `<h4>PvP -  ${playerStats.points.pvp.toLocaleString()} Points [${playerStats.pvp.time}]</h4>` +
                                                `<table class='table'><thead>` +
                                                `</thead><tbody>` +
                                                `<tr>` +
                                                `<th scope='row'>PvP Wins:</th>` +
                                                `<td>${playerStats.pvp.wins.toLocaleString()}`;
                                            if (playerStats.pvp.wins != `0`) {
                                                contentHTML += ` [${playerStats.pvp.ratio}]`;
                                            }
                                            contentHTML += `</td></tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Trials Wins: </th>` +
                                                `<td>${playerStats.trials.wins.toLocaleString()}`;
                                            if (playerStats.trials.wins != `0`) {
                                                contentHTML += ` [${playerStats.trials.ratio}]`;
                                            }
                                            contentHTML += `</td></tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Iron Banner Wins:</th>` +
                                                `<td>${playerStats.ib.wins.toLocaleString()}`;
                                            if (playerStats.ib.wins != `0`) {
                                                contentHTML += ` [${playerStats.ib.ratio}]`;
                                            }
                                            contentHTML += `</td></tr>` +
                                                `</tbody></table>`;

                                            contentHTML += `</div>` +
                                                `</div>`;

                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);


                                        //Load PvE Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-pve`);
                                            var contentHTML = ``;

                                            contentHTML += `<div class='card-block row'>` +
                                                `<div id='points_panel_pve' class='panel col'>` +
                                                `<table class='table'><thead>` +
                                                `<tr><th>Activity</th><th>Completions</th><th>KDA</th><th>Time Played</th></tr>` +
                                                `</thead><tbody>` +
                                                `<tr class="table-active">` +
                                                `<th scope='row'>Overall (PvE)</th>` +
                                                `<td>${playerStats.pve.clears.toLocaleString()}</td>` +
                                                `<td>${playerStats.pve.kda.toLocaleString()}</td>` +
                                                `<td>${playerStats.pve.time}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Raids</th>` +
                                                `<td>${playerStats.raid.comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.kda.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.time}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Nightfalls</th>` +
                                                `<td>${playerStats.nf.comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.nf.kda.toLocaleString()}</td>` +
                                                `<td>${playerStats.nf.time}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Strikes</th>` +
                                                `<td>${playerStats.strike.comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.strike.kda.toLocaleString()}</td>` +
                                                `<td>${playerStats.strike.time}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Normal Events</th>` +
                                                `<td>${playerStats.pve.public_events.toLocaleString()}</td>` +
                                                `<td>-</td>` +
                                                `<td>-</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Heroic Events</th>` +
                                                `<td>${playerStats.pve.heroic_events.toLocaleString()}</td>` +
                                                `<td>-</td>` +
                                                `<td>-</td>` +
                                                `</tr>` +
                                                `</tbody></table>` +

                                                `</div>` +
                                                `</div>`;

                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);

                                        //Load Raids Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-raids`);
                                            var contentHTML = ``;

                                            contentHTML += `<div class='card-block row'>` +
                                                `<div id='points_panel_raids' class='panel col'>` +
                                                `<table class='table'><thead>` +
                                                `<tr><th>Completions</th><th>Normal</th><th>Prestige</th><th>Guided Games</th></tr>` +
                                                `</thead><tbody>` +
                                                `<tr class="table-active">` +
                                                `<th scope='row'>Overall (Raids)</th>` +
                                                `<td>${playerStats.raid.normal_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.hard_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.gg_comps.toLocaleString()}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Leviathan</th>` +
                                                `<td>${playerStats.raid.lev_normal_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.lev_hard_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.lev_gg_comps.toLocaleString()}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Eater of Worlds</th>` +
                                                `<td>${playerStats.raid.eow_normal_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.eow_hard_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.eow_gg_comps.toLocaleString()}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Spire of Stars</th>` +
                                                `<td>${playerStats.raid.sos_normal_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.sos_hard_comps.toLocaleString()}</td>` +
                                                `<td>${playerStats.raid.sos_gg_comps.toLocaleString()}</td>` +
                                                ` </tr>` +
                                                `</tbody></table>` +
                                                `</div>` +
                                                `</div>`;

                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);

                                        //Load PvP Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-pvp`);
                                            var contentHTML = ``;

                                            contentHTML += `<div class='card-block row'>` +
                                                `<div id='points_panel_pvp' class='panel col'>` +
                                                `<table class='table'><thead>` +
                                                `<tr><th>Activity</th><th>Wins</th><th>Win Ratio</th><th>KDR [KDA]</th><th>Time Played</th></tr>` +
                                                `</thead><tbody>` +
                                                `<tr class="table-active">` +
                                                `<th scope='row'>Overall (PvP)</th>` +
                                                `<td>${playerStats.pvp.wins.toLocaleString()}</td>` +
                                                `<td>${playerStats.pvp.ratio.toLocaleString()}</td>` +
                                                `<td>${playerStats.pvp.kdr.toLocaleString()} [${playerStats.pvp.kda.toLocaleString()}]</td>` +
                                                `<td>${playerStats.pvp.time}</td>` +
                                                ` </tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Trials</th>` +
                                                `<td>${playerStats.trials.wins.toLocaleString()}</td>` +
                                                `<td>${playerStats.trials.ratio.toLocaleString()}</td>` +
                                                `<td>${playerStats.trials.kdr.toLocaleString()} [${playerStats.trials.kda.toLocaleString()}]</td>` +
                                                `<td>${playerStats.trials.time}</td>` +
                                                `</tr>` +
                                                `<tr>` +
                                                `<th scope='row'>Iron Banner</th>` +
                                                `<td>${playerStats.ib.wins.toLocaleString()}</td>` +
                                                `<td>${playerStats.ib.ratio.toLocaleString()}</td>` +
                                                `<td>${playerStats.ib.kdr.toLocaleString()} [${playerStats.ib.kda.toLocaleString()}]</td>` +
                                                `<td>${playerStats.ib.time}</td>` +
                                                `</tr>` +
                                                `</tbody></table>` +
                                                `</div>` +
                                                `</div>`;

                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);

                                        //Load Chars Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-chars`);
                                            var contentHTML = ``;

                                            contentHTML += `<div style="margin-top: 15px">`;

                                            $.each(charIDs, function (index, value) {
                                                var charID = value;
                                                d2API.getVendor(membershipType, membershipId, charID, 2190858386, function (respXur) {
                                                    console.log(`Xur [${charID}]`);
                                                    console.dir(respXur);
                                                    if (respXur.Response) {
                                                        myXurItems = [];
                                                        var xurItems = respXur.Response.sales.data;
                                                        for (var key in xurItems) {
                                                            var item = xurItems[key];
                                                            myXurItems.push(d2DB.lookupItem(item.itemHash));
                                                        }
                                                    } else {
                                                        console.log("Xur not found");
                                                    }
                                                });
                                                var char = profile.characters.data[value];


                                                contentHTML += `<div class="card" style="width:402px;margin: 15px;">`;

                                                contentHTML += `<div class='char-emblem-bg' style='border: solid 2px rgba(0, 0, 0, 0.5);background: url("https://www.bungie.net${char.emblemBackgroundPath}");background-size: cover;' ><span class='char-level'>Level ${char.baseCharacterLevel}</span><span class='char-desc'>${GENDER_ENUM[char.genderType]} ${RACE_ENUM[char.raceType]}</span><span class='char-light light-level'>${char.light}</span><span class='class-name'>${CLASS_ENUM[char.classType]}</span>`;

                                                var progress = profile.characterProgressions.data[value];
                                                $.each(progress.progressions, function (index, value) {
                                                    var p = d2DB.lookupProgression(value.progressionHash)[0];
                                                    switch (p.displayProperties.displayUnitsName) {
                                                        case "Personal Clan XP":
                                                            /* 
                                                            contentHTML += `<tr>` +
                                                                `<td scope='row'><div title='${p.displayProperties.description}'>${p.displayProperties.displayUnitsName}</div></td>` +
                                                                `</tr>`;
                                                                */
                                                            break;
                                                        case "Clan XP":

                                                            //584850370

                                                            /* 
                                                                contentHTML += `<tr>` +
                                                                    `<td scope='row'><div title='${p.displayProperties.description}'>${p.displayProperties.displayUnitsName}</div></td>` +
                                                                    `</tr>`;
                                                                    */
                                                            break;
                                                        case "Clarion Call XP":
                                                            /* 
                                                            contentHTML += `<tr>` +
                                                                `<td scope='row'><div title='${p.displayProperties.description}'>${p.displayProperties.displayUnitsName}</div></td>` +
                                                                `</tr>`;
                                                                */
                                                            break;
                                                        case "XP":
                                                            var levelPerc = Math.round(100 * value.progressToNextLevel / (value.nextLevelAt));
                                                            contentHTML += `<div class="progress" title="${levelPerc}%" data-toggle="tooltip" data-placement="bottom" style="width: 394px;margin-left: 2px;margin-right: 2px;position: absolute;bottom: 1px;height: 8px;"><div class="progress-bar progress-bar-striped bg-success" style="width:${levelPerc}%" ></div></div>`;

                                                            /* 
                                                            contentHTML += `<tr>` +
                                                                `<td scope='row'><div title='${p.displayProperties.description}'>${p.displayProperties.displayUnitsName}</div></td>` +
                                                                `</tr>`;
                                                                */
                                                            break;
                                                    }

                                                });
                                                contentHTML += `</div>`;
                                                contentHTML += `</div>`;

                                                contentHTML += `<div><div >`;

                                                $.each(progress.factions, function (index, value) {
                                                    if (value.currentProgress > 0) {
                                                        var f = d2DB.lookupFaction(value.factionHash)[0];
                                                        if (f.displayProperties.hasIcon) {

                                                            var percent = Math.round(100 * value.currentProgress / (value.currentProgress + value.progressToNextLevel));
                                                            contentHTML += `<div style="padding:10px;text-align: center;display: inline-block; border:none; width: calc(5% + 100px);box-shadow: none;">` +
                                                                `<img  alt="${f.displayProperties.name}" class='platIcon' src='https://www.bungie.net${f.displayProperties.icon}' data-toggle="tooltip" data-placement="top"  title='${f.displayProperties.name}' style='margin-left: auto;margin-right: auto; border:none;'/>` +
                                                                `<div class="card-block">` +
                                                                `<p class="card-text">Level ${value.level}</p><div class="progress" title="${percent}%" data-toggle="tooltip" data-placement="bottom" style="width: 80%;margin-left: auto;margin-right: auto;"><div class="progress-bar progress-bar-striped bg-success" style="width:${percent}%" ></div></div>` +
                                                                `</div></div>`;

                                                        }
                                                    }

                                                });

                                                contentHTML += `</div></div>`;
                                            });


                                            contentHTML += `</div>`;


                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);

                                        //Load Hist Tab
                                        setTimeout(function () {
                                            var container = $(`#${elementID}-hist`);
                                            var contentHTML = ``;

                                            contentHTML += `<div class='card-block row'>` +
                                                `<table class='table table-bordered'>` +
                                                `<thead>`;
                                            $.each(charIDs, function (index, value) {
                                                var char = profile.characters.data[value];
                                                contentHTML += `<th> <div class='char-emblem-bg' style='border: solid 2px rgba(0, 0, 0, 0.5);background: url("https://www.bungie.net${char.emblemBackgroundPath}");background-size: cover; width:400px;'><span class='char-level'>Level ${char.baseCharacterLevel}</span><span class='char-desc'>${GENDER_ENUM[char.genderType]} ${RACE_ENUM[char.raceType]}</span><span class='char-light light-level'>${char.light}</span> <span class='class-name'>${CLASS_ENUM[char.classType]}</span></div> </th>`;
                                            });
                                            contentHTML += `</thead><tbody>` +
                                                `</div>`;

                                            $(container).append(contentHTML);

                                            $(function () {
                                                $('[data-toggle="tooltip"]').tooltip();
                                            });
                                        }, ajaxDelay);

                                        if (!silent) {
                                            $("#UserSubmitBtn").removeClass("disabled");
                                            $("#UserSubmitBtn").text("Search");
                                            $(`#UserNameTxt`).val(``);
                                        }
                                    });
                                });

                            });
                        } else {

                            displayErrorPlayer("Error", `Player not found.`, silent);

                            $("#UserSubmitBtn").removeClass("disabled");
                            $("#UserSubmitBtn").text("Search");
                        }
                    } else {
                        displayErrorPlayer("Error", `Destiny data not found for player.`, silent);

                        $("#UserSubmitBtn").removeClass("disabled");
                        $("#UserSubmitBtn").text("Search");
                    }

                } else {
                    $("#modalError .error-title").text("Bungie API Error")
                    $("#modalError .error-msg").text(`${response.Message}`)
                    $("#modalError").modal();

                    $("#UserSubmitBtn").removeClass("disabled");
                    $("#UserSubmitBtn").text("Search");
                }

            });

        }, ajaxDelay);
    }
}


function lookupClan(name, silent = false) {
    if (!loading && name.trim()) {
        setTimeout(function () {
            d2API.getClan(name, "1", function (response) {

                if (response.ErrorCode == 1) {

                    var clan = response.Response;
                    if (clan) {

                        if (!silent) {
                            $("#ClanSubmitBtn").addClass("disabled");
                            $("#ClanSubmitBtn").text("Loading...");
                            $("#ClanIDTxt").val("");
                        }
                        console.dir(clan);
                        var clanID = clan.detail.groupId;

                        /*********
                        d2API.getAdminsAndFounderOfGroup(clanID, function(adminsResp){
                            console.log(adminResp);
                        });
                        *************/


                        d2API.getPendingMemberships(clanID, function (pendingResp) {
                            console.dir(pendingResp);

                            var pendingCount = 0;
                            var pendingMembers = [];

                            if (pendingResp.ErrorCode == 1) {
                                pendingCount = pendingResp.Response.totalResults;
                                pendingMembers = pendingResp.Response.results;
                            }

                            d2API.getMembersOfGroup(clanID, 0, "", 1, function (response) {


                                var members = response.Response.results;
                                var increment = 100 / members.length;
                                $("#clanSearchResults").html(`<div id="tblStatsCon" class="contentContainer" style="display:none"><div class="texturedPanel glass"></div><div class="card-block" style="padding:20px;"><button type="button" class="btn btn-danger pendingMemberBadge" title="Pending Requests" data-toggle="tooltip" data-placement="top" onclick='displayPending(${clanID}, ${JSON.stringify(pendingMembers)});' style="float:right;position: relative;bottom: 5px;border-radius: 20px;font-weight: bold;display: none;"></button><div class="clanStatsBar"><h4><span class="badge badge-danger" style="position: relative;bottom: 2px;">${clan.detail.clanInfo.clanCallsign}</span> <a class="clanNameLink" href="https://www.bungie.net/en/ClanV2?groupid=${clanID}" target="_blank">${clan.detail.name}</a><img class="clanLoadSpinner" src="img/Eclipse.svg"  /></h4><div class="progress" title="Loading..." data-toggle="tooltip" data-placement="bottom" style="height: 15px;margin-bottom:10px;"><div class="progress-bar progress-bar-striped bg-success active" style="width:0%;color:black;text-weight:bold;" data-increment="${increment}" data-progress="0"></div></div></div><table id="tblStats" class="table table-striped  table-hover" ><thead class="thead-inverse"><tr><th onclick="sortTable(0, 'string')" class="sortable">Username</th><th onclick="sortTable(1, 'int')" class="sortable">Total Score</th><th onclick="sortTable(2, 'int')" class="sortable">PvE Score</th><th onclick="sortTable(3, 'int')" class="sortable">PvP Score</th><th onclick="sortTable(4, 'date')" class="sortable">Last Active</th></tr></thead><tbody></tbody></table></div></div>`);
                                $("#clanSearchResults").show();
                                $("#tblStatsCon").slideDown();

                                $(".pendingMemberBadge").tooltip();

                                for (var i = 0; i < members.length; i++) {
                                    var m = members[i];

                                    var contentHTML = `<tr id="tr-${m.destinyUserInfo.membershipId}" style="">` +
                                        `<td><a href='#!' onclick='lookupPlayer("${m.destinyUserInfo.membershipType}", "${m.destinyUserInfo.membershipId}", true);'>`;

                                    contentHTML += `<img class="${m.destinyUserInfo.membershipType == 4 ? "blizIcon platIcon" : "platIcon"}" src="${PLAT_ICONS[m.destinyUserInfo.membershipType]}" style="margin-right: 10px; width: 30px; height: 30px;"/>`;

                                    contentHTML += `${m.destinyUserInfo.displayName}</a></td>` +
                                        `</tr>`;


                                    $("#tblStatsCon tbody").append(contentHTML);
                                }

                                if (pendingCount > 0) {
                                    $("#tblStatsCon .pendingMemberBadge").text(`+${pendingCount}`);
                                    $("#tblStatsCon .pendingMemberBadge").fadeIn();
                                }


                                renderClanMemberStats($("#tblStatsCon tbody"), members);
                            });

                        });
                    } else {
                        displayErrorClan("Error", "Clan not found.", silent);
                    }

                } else {
                    displayErrorClan("Bungie API Error", response.Message, silent);
                }
            })
        }, ajaxDelay);
    }

}
function approveMember(groupId, membershipType, membershipId) {
    d2API.approvePending(groupId, membershipType, membershipId, function (approveResp) {
        console.log(approveResp);
    });
}
function displayPending(groupId, members) {
    console.dir(members);

    $("#modalPendingMembers .msg").html("");
    var memberStr = "";
    for (var m = 0; m < members.length; m++) {
        $("#modalPendingMembers .msg").append(`<div id="${members[m].destinyUserInfo.membershipId}_requestCon"><img class="platIcon" src="${PLAT_ICONS[members[m].destinyUserInfo.membershipType]}" style="margin-right:15px;"/>${members[m].destinyUserInfo.displayName} <button class="btn btn-secondary approveBtn" style=" margin-left: 10px;" onclick="approveMember('${groupId}','${members[m].destinyUserInfo.membershipType}','${members[m].destinyUserInfo.membershipId}');$('#${members[m].destinyUserInfo.membershipId}_requestCon').slideUp();">Approve</button></div>`);
    }

    $("#modalPendingMembers .approveAll").click(function () {
        d2API.approveAllPending(groupId, function (approveAllResp) {
            console.dir(approveAllResp);
        });
    })
    $("#modalPendingMembers .denyAll").click(function () {
        d2API.denyAllPending(groupId, function (denyAllResp) {
            console.dir(denyAllResp);
        });
    })
    $("#modalPendingMembers").modal();
}

function fetchPlayerStats(profile, callback) {
    var playerStats;
    if (profile) {
        playerStats = {
            raid: {},
            nf: {},
            strike: {},
            pve: {},
            pvp: {},
            ib: {},
            trials: {},
            points: {},
            total: {}
        };
        setTimeout(function () {
            d2API.getHistoricalStats(profile.profile.data.userInfo.membershipType, profile.profile.data.userInfo.membershipId, 0, function (response) {

                var stats = response.Response;
                var activityStats = [];
                var activityHists = [];

                $.each(profile.profile.data.characterIds, function (index, value) {
                    var charStatsReq = d2API.getDestinyAggregateActivityStats(profile.profile.data.userInfo.membershipType, profile.profile.data.userInfo.membershipId, value);
                    if (charStatsReq.ErrorCode == 1) {
                        activityStats.push(charStatsReq.Response);
                    } else {
                        displayErrorPlayer("Bungie API Error", charStatsReq.Message);
                    }
                });



                playerStats.raid.comps = 0;
                playerStats.raid.normal_comps = 0;
                playerStats.raid.hard_comps = 0;
                playerStats.raid.gg_comps = 0;
                playerStats.raid.lev_normal_comps = 0;
                playerStats.raid.lev_hard_comps = 0;
                playerStats.raid.lev_gg_comps = 0;
                playerStats.raid.eow_normal_comps = 0;
                playerStats.raid.eow_hard_comps = 0;
                playerStats.raid.eow_gg_comps = 0;
                playerStats.raid.sos_normal_comps = 0;
                playerStats.raid.sos_hard_comps = 0;
                playerStats.raid.sos_gg_comps = 0;
                playerStats.raid.kda = 0;
                playerStats.raid.time = "N/A";
                playerStats.nf.comps = 0;
                playerStats.nf.kda = 0;
                playerStats.nf.time = "N/A";
                playerStats.strike.comps = 0;
                playerStats.strike.kda = 0;
                playerStats.strike.time = "N/A";
                playerStats.pve.public_events = 0;
                playerStats.pve.heroic_events = 0;
                playerStats.pve.clears = 0;
                playerStats.pve.kda = 0;
                playerStats.pve.kdr = 0;
                playerStats.pve.time = "N/A";
                playerStats.pvp.wins = 0;
                playerStats.pvp.ratio = 0;
                playerStats.pvp.kda = 0;
                playerStats.pvp.kdr = 0;
                playerStats.pvp.time = "N/A";
                playerStats.ib.wins = 0;
                playerStats.ib.ratio = 0;
                playerStats.ib.kda = 0;
                playerStats.ib.kdr = 0;
                playerStats.ib.time = "N/A";
                playerStats.trials.wins = 0;
                playerStats.trials.ratio = 0;
                playerStats.trials.kda = 0;
                playerStats.trials.kdr = 0;
                playerStats.trials.time = "N/A";
                playerStats.points.pve = 0;
                playerStats.points.pvp = 0;
                playerStats.points.total = 0;
                playerStats.total_time = "N/A";

                $.each(activityStats, function (i, as) {
                    $.each(as.activities, function (i, a) {
                        var activity = d2DB.lookupActivity(a.activityHash)[0];
                        if (activity && activity.displayProperties.name)
                            switch (activity.displayProperties.name) {
                                case "Leviathan":
                                    switch (activity.tier) {
                                        case 0:
                                            playerStats.raid.normal_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.lev_normal_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 1:
                                            playerStats.raid.gg_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.lev_gg_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 2:
                                            playerStats.raid.hard_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.lev_hard_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        default:
                                            console.log("Lev - Other Tier:");
                                            console.dir(activity);
                                            break;
                                    }
                                    break;
                                case "Leviathan, Eater of Worlds":
                                    switch (activity.tier) {
                                        case 0:
                                            playerStats.raid.normal_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.eow_normal_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 1:
                                            playerStats.raid.gg_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.eow_gg_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 2:
                                            playerStats.raid.hard_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.eow_hard_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        default:
                                            console.log("EOW - Other Tier:");
                                            console.dir(activity);
                                            break;
                                    }
                                    break;
                                case "Leviathan, Spire of Stars":
                                    switch (activity.tier) {
                                        case 0:
                                            playerStats.raid.normal_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.sos_normal_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 1:
                                            playerStats.raid.gg_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.sos_gg_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        case 2:
                                            playerStats.raid.hard_comps += a.values.activityCompletions.basic.value;
                                            playerStats.raid.sos_hard_comps += a.values.activityCompletions.basic.value;
                                            break;
                                        default:
                                            console.log("SOS - Other Tier:");
                                            console.dir(activity);
                                            break;
                                    }
                                    break;
                                default:
                                    //console.log(`Non-raid activity`);
                                    //console.log(`Name: '${activity.displayProperties.name}' - Tier: ${activity.tier}`);
                                    //console.dir(activity);
                                    break;
                            }

                    });
                });


                if (stats.raid.allTime) {
                    playerStats.raid.time = stats.raid.allTime.secondsPlayed.basic.displayValue;
                    playerStats.raid.comps = parseInt(stats.raid.allTime.activitiesCleared.basic.displayValue);
                    playerStats.raid.kda = parseFloat(stats.raid.allTime.killsDeathsAssists.basic.displayValue);
                }
                if (stats.nightfall.allTime) {
                    playerStats.nf.time = stats.nightfall.allTime.secondsPlayed.basic.displayValue;
                    playerStats.nf.comps = parseInt(stats.nightfall.allTime.activitiesCleared.basic.displayValue);
                    playerStats.nf.kda = parseFloat(stats.nightfall.allTime.killsDeathsAssists.basic.displayValue);
                }
                if (stats.allStrikes.allTime) {
                    playerStats.strike.time = stats.allStrikes.allTime.secondsPlayed.basic.displayValue;
                    playerStats.strike.comps = parseInt(stats.allStrikes.allTime.activitiesCleared.basic.displayValue);
                    playerStats.strike.kda = parseFloat(stats.allStrikes.allTime.killsDeathsAssists.basic.displayValue);
                }
                if (stats.allPvE.allTime) {
                    playerStats.pve.time = stats.allPvE.allTime.secondsPlayed.basic.displayValue;
                    playerStats.pve.heroic_events = parseInt(stats.allPvE.allTime.heroicPublicEventsCompleted.basic.value);
                    playerStats.pve.public_events = (parseInt(stats.allPvE.allTime.publicEventsCompleted.basic.value) - playerStats.pve.heroic_events);
                    playerStats.pve.kda = parseFloat(stats.allPvE.allTime.killsDeathsAssists.basic.displayValue);
                    playerStats.pve.clears = parseInt(stats.allPvE.allTime.activitiesCleared.basic.displayValue);
                }
                if (stats.allPvP.allTime) {
                    playerStats.pvp.time = stats.allPvP.allTime.secondsPlayed.basic.displayValue;
                    playerStats.pvp.wins = parseInt(stats.allPvP.allTime.activitiesWon.basic.value);
                    playerStats.pvp.ratio = stats.allPvP.allTime.winLossRatio.basic.displayValue;
                    playerStats.pvp.kda = parseFloat(stats.allPvP.allTime.killsDeathsAssists.basic.displayValue);
                    playerStats.pvp.kdr = parseFloat(stats.allPvP.allTime.killsDeathsRatio.basic.displayValue);
                }
                if (stats.ironBanner.allTime) {
                    playerStats.ib.time = stats.ironBanner.allTime.secondsPlayed.basic.displayValue;
                    playerStats.ib.wins = parseInt(stats.ironBanner.allTime.activitiesWon.basic.value);
                    playerStats.ib.ratio = stats.ironBanner.allTime.winLossRatio.basic.displayValue;
                    playerStats.ib.kda = parseFloat(stats.ironBanner.allTime.killsDeathsAssists.basic.displayValue);
                    playerStats.ib.kdr = parseFloat(stats.ironBanner.allTime.killsDeathsRatio.basic.displayValue);
                }
                if (stats.trialsofthenine.allTime) {
                    playerStats.trials.time = stats.trialsofthenine.allTime.secondsPlayed.basic.displayValue;
                    playerStats.trials.wins = parseInt(stats.trialsofthenine.allTime.activitiesWon.basic.value);
                    playerStats.trials.ratio = stats.trialsofthenine.allTime.winLossRatio.basic.displayValue;
                    playerStats.trials.kda = parseFloat(stats.trialsofthenine.allTime.killsDeathsAssists.basic.displayValue);
                    playerStats.trials.kdr = parseFloat(stats.trialsofthenine.allTime.killsDeathsRatio.basic.displayValue);
                }

                playerStats.points.pve = (playerStats.raid.sos_hard_comps * 2000) + ((playerStats.raid.sos_normal_comps + playerStats.raid.sos_gg_comps) * 1000) + (playerStats.raid.eow_hard_comps * 2000) + ((playerStats.raid.eow_normal_comps + playerStats.raid.eow_gg_comps) * 1000) + (playerStats.raid.lev_hard_comps * 3000) + ((playerStats.raid.lev_normal_comps + playerStats.raid.lev_gg_comps) * 1500) + (playerStats.nf.comps * 500) + (playerStats.strike.comps * 150) + (playerStats.pve.heroic_events * 25) + (playerStats.pve.public_events * 25);
                playerStats.points.pvp = (playerStats.pvp.wins * 50) + (playerStats.ib.wins * 50) + (playerStats.trials.wins * 250);
                playerStats.points.total = playerStats.points.pve + playerStats.points.pvp;

                callback(playerStats);
            })

        }, ajaxDelay);

    }
}

function fetchPlayerPoints(profile, callback) {

    var points = { total: 0, pve: 0, pvp: 0 };

    d2API.getHistoricalStats(profile.profile.data.userInfo.membershipType, profile.profile.data.userInfo.membershipId, 0, function (response) {

        var stats = response.Response;

        if (stats.raid.allTime) {
            points.pve += parseInt(stats.raid.allTime.activitiesCleared.basic.displayValue) * 1500;
        }
        if (stats.nightfall.allTime) {
            points.pve += parseInt(stats.nightfall.allTime.activitiesCleared.basic.displayValue) * 500;
        }
        if (stats.allStrikes.allTime) {
            points.pve += parseInt(stats.allStrikes.allTime.activitiesCleared.basic.displayValue) * 150;
        }
        if (stats.allPvE.allTime) {
            points.pve += parseInt(stats.allPvE.allTime.heroicPublicEventsCompleted.basic.value) * 25;
            points.pve += (parseInt(stats.allPvE.allTime.publicEventsCompleted.basic.value) - parseInt(stats.allPvE.allTime.heroicPublicEventsCompleted.basic.value)) * 25;
        }
        if (stats.allPvP.allTime) {
            points.pvp += parseInt(stats.allPvP.allTime.activitiesWon.basic.value) * 50;
        }
        if (stats.ironBanner.allTime) {
            points.pvp += parseInt(stats.ironBanner.allTime.activitiesWon.basic.value) * 50;
        }
        if (stats.trialsofthenine.allTime) {
            points.pvp += parseInt(stats.trialsofthenine.allTime.activitiesWon.basic.value) * 250;
        }

        points.total = points.pve + points.pvp;

        callback(points);
    });
}

function closeCard(cardID) {
    $(`#${cardID}`).slideUp(400, function () {
        $(`#${cardID}`).remove();

        if ($(`#userSearchResults .card`).length == 0) {
            $(`#userSearchResults`).hide();
        }
    });
}

function initListeners() {
    $(`#ClanSubmitBtn`).click(function () {
        lookupClan($(`#ClanIDTxt`).val());
    });

    $(`#UserSubmitBtn`).click(function () {
        if ($(`#UserNameTxt`).val()) {
            $(`#UserSubmitBtn`).addClass(`disabled`);
            $(`#UserSubmitBtn`).text(`Loading...`);

            setTimeout(function () {
                d2API.searchPlayer("-1", $(`#UserNameTxt`).val(), function (response) {

                    var silent = false;
                    if (!response.status) {
                        if (response.ErrorCode == 1) {
                            var players = response.Response;
                            if (players && players.length > 0) {
                                if (players.length > 1) {
                                    $("#ChooseUserPrompt").html(``);
                                    $("#ChooseUserPrompt").append(`<h4>Multiple users found!</h4>`);
                                    $("#ChooseUserPrompt").append(`<ul>`);
                                    $.each(players, function (i, p) {
                                        $("#ChooseUserPrompt").append(`<li style='list-style:none'><a href='#!' onclick='lookupPlayer("${p.membershipType}","${p.membershipId}", false);$("#ChooseUserPrompt").slideUp();'><img class='platIcon' src='https://www.bungie.net${p.iconPath}'/> ${p.displayName}</a></li>`);
                                    });
                                    $("#ChooseUserPrompt").append(`</ul>`);
                                    $("#ChooseUserPrompt").slideDown();
                                } else {
                                    lookupPlayer(players[0].membershipType, players[0].membershipId, silent);
                                }
                            } else {
                                displayErrorPlayer(`Error`, `Player not found.`, silent);
                            }
                        } else {
                            displayErrorPlayer(`Bungie API Error`, response.Message, silent);
                        }

                    } else if (response.status = 401) {
                        logoutBnet();
                    } else {
                        displayErrorPlayer(`Error`, `An unknown error has occured. [${response.status}]`, silent);
                    }
                })

            }, ajaxDelay);
        }
        $(`#UserSubmitBtn`).removeClass(`disabled`);
        $(`#UserSubmitBtn`).text(`Search`);

    });

    $(`#UserNameTxt`).on(`input`, function () {
        $(`#UserNameTxtErr`).slideUp();
        $(`#ChooseUserPrompt`).slideUp();
        $(`#UserNameTxt`).removeClass(`is-invalid`);
    });

    $(`#ClanIDTxt`).on(`input`, function () {
        $(`#ClanIDTxtErr`).slideUp();
        $(`#ClanIDTxt`).removeClass(`is-invalid`);
    });


    $(`#UserNameTxt`).on(`keyup`, function (e) {
        if (e.keyCode == 13) {
            $(`#UserSubmitBtn`).click();
        }
    });


    $("#ClanIDTxt").on(`keyup`, function (e) {
        if (e.keyCode == 13) {
            $(`#ClanSubmitBtn`).click();
        }
    });

}


function displayError(title, message, containerID, silent) {
    if (!silent) {
        $(`${containerID}Err`).html(`<h5>${title}:</h5>${message}`);
        $(`${containerID}`).addClass("is-invalid");
        $(`${containerID}Err`).slideDown();
    } else {
        $("#modalError .error-title").text(`${title}`);
        $("#modalError .error-msg").html(`${message}`);
        $("#modalError").modal();
    }
}


function displayErrorClan(title, message, silent) {
    displayError(title, message, "#ClanIDTxt", silent);
}


function displayErrorPlayer(title, message, silent) {
    displayError(title, message, "#UserNameTxt", silent);
}

function displayXur(response, force = false, itemsOverride = false) {

    var dismissHash = "";
    var items = [];
    var weapons = [];
    var armor = [];
    var other = [];

    if (itemsOverride == false || myXurItems.length < 1) {
        var locationURL = "/img/theme/destiny/bgs/pgcrs/placeholder.jpg";

        var filename = "xur_";
        var planetName = "The Tower";
        var regionName = "Hangar";
        if (response.location && response.location.planet && XUR_LOCATIONS[response.location.planet]) {

            if (response.location && response.location.region) {
                regionName = response.location.region;
            }

            if (response.location.planet) {
                filename += response.location.planet.toLowerCase().replace(/[^a-zA-Z]/g, "_");
                planetName = response.location.planet;

                var resp = d2DB.lookupActivity(XUR_LOCATIONS[response.location.planet])[0];
                if (resp) {
                    locationURL = resp.pgcrImage;
                }
            }
        }

        for (var i = 0; i < response.itemHashes.length; i++) {
            dismissHash += response.itemHashes[i];
        }
        var mapURL = `img/xur/${filename}.jpg`;
        if (force || dismissHash != Cookies.get("xur_dismissHash")) {
            var responseBody = `<h5>Location:</h5><div class="activity-container" style="position: relative; background-size: cover;background-position-y: center;border-radius: 5px;background-image: url(https://www.bungie.net${locationURL});"`;

            $.get(mapURL)
                .done(function () {
                    responseBody += `data-html="true"   data-toggle="tooltip" data-placement="right" title="<div style='position:relative;width:30vw;height:30vw;border-top: 5px solid black;border-bottom: 5px solid black;'><img src='${mapURL}' style='border-radius:5px;width:100%; height:100%'/></div>"`;
                }).fail(function () {

                }).always(function () {
                    responseBody += `><div style="position:absolute; font-size: 18pt;bottom: -5px;left: 5px;" >${planetName}, ${regionName}</div></div>\n`;
                    responseBody += `<h5>Inventory:</h5>`;
                    for (var i = 0; i < response.itemHashes.length; i++) {
                        var item = d2DB.lookupItem(response.itemHashes[i]);

                        items.push(item);

                        if (item.itemCategoryHashes[2]) {
                            if (item.itemCategoryHashes[2] == 20) {
                                armor.push(item);
                            } else {
                                weapons.push(item);
                            }
                        } else {

                            other.push(item);
                        }
                    }

                    for (var w = 0; w < weapons.length; w++) {
                        var item = weapons[w];
                        responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-weapon' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #ceae33;'/></a>`;
                    }
                    for (var a = 0; a < armor.length; a++) {
                        var item = armor[a];
                        responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-armor' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${CLASS_ENUM[item.classType]} ${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #ceae33;'/></a>`;
                    }
                    for (var o = 0; o < other.length; o++) {
                        var item = other[o];
                        responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-other' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #4d2b5d;'/></a>`;
                    }

                    console.dir(items);

                    $("#modalXur .dismissXur").attr("onclick", `dismissXur("${dismissHash}");`);
                    $("#modalXur .error-msg").html(`${responseBody}`);
                    $('[data-toggle="tooltip"]').tooltip();
                    $("#modalXur").modal();
                })

        } else {
            console.log(`Xur dissmised [${dismissHash}]`);
        }
    } else {
        var locationURL = "/img/theme/destiny/bgs/pgcrs/placeholder.jpg";

        var planetName = "The Tower";
        var regionName = "Hangar";
        items = myXurItems;

        var responseBody = `<h5>Location:</h5><div class="activity-container" style="position: relative; background-size: cover;background-position-y: center;border-radius: 5px;background-image: url(https://www.bungie.net${locationURL});"><div style="position:absolute; font-size: 18pt;bottom: -5px;left: 5px;" >${planetName}, ${regionName}</div></div>\n`;
        responseBody += `<h5>Inventory:</h5>`;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.itemCategoryHashes[2]) {
                if (item.itemCategoryHashes[2] == 20) {
                    armor.push(item);
                } else {
                    weapons.push(item);
                }
            } else {

                other.push(item);
            }
        }

        for (var w = 0; w < weapons.length; w++) {
            var item = weapons[w];
            responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-weapon' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #ceae33;'/></a>`;
        }
        for (var a = 0; a < armor.length; a++) {
            var item = armor[a];
            responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-armor' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${CLASS_ENUM[item.classType]} ${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #ceae33;'/></a>`;
        }
        for (var o = 0; o < other.length; o++) {
            var item = other[o];
            responseBody += `<a href='https://db.destinytracker.com/d2/en/items/${item.hash}' target="_blank"><img class='blizIcon xurItem item-other' src='https://www.bungie.net${item.displayProperties.icon}' title="${item.displayProperties.name}<br><em>[${item.itemTypeDisplayName}]</em>" data-html="true" data-toggle="tooltip" data-placement="bottom" style='width:50px;margin-right:10px;border-radius:5px;border: 2px outset #4d2b5d;'/></a>`;
        }



        console.dir(items);

        $("#modalXur .error-msg").html(`${responseBody}`);
        $('[data-toggle="tooltip"]').tooltip();
        $("#modalXur").modal();

    }
}

function dismissXur(dismissHash) {
    Cookies.set("xur_dismissHash", dismissHash);
}


function setBG(url = "https://www.adamtcarruthers.com/destiny/img/bg/warmind.jpg", color = "#79000066") {
    $("head").append(`<style>` +
        `body {` +
        `background-image: url('${url}');` +
        `}` +
        `.glass {` +
        `background-color: ${color} !important;` +
        `}` +
        `</style>`);
}