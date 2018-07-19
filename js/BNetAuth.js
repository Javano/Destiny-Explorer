function logoutBnet() {
    Cookies.remove("authAccessToken");
    Cookies.remove("authRefreshToken");
    Cookies.remove("authMembershipID");
    location.reload();
}

function loadBNetUser(bNetUser) {

    $("#userBar").append(`<button class="btn btn-secondary dropdown-toggle glass" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>`);
    $("#userBar button").append(`<img id="userProfilePic" src="https://www.bungie.net/${bNetUser.bungieNetUser.profilePicturePath}"/>`);
    $("#userBar button").append(`<p id="userDisplayName">${bNetUser.bungieNetUser.displayName}</p>`);

    $("#userBar").prepend(`<div id="userDropdown" class="dropdown-menu  dropdown-menu-right glass" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 68px, 0px); top: 0px; left: 0px; will-change: transform;"><div id="player-items"><h4>My Accounts</h4></div><div id="clan-items"><div class="dropdown-divider"></div><h4>My Clans</h4></div></div>`);

    var clanCount = 0;
    $.each(bNetUser.destinyMemberships, function (index, membership) {
        switch (membership.membershipType) {
            case 1:
                $(`#userBar .dropdown-menu #player-items`).append(`<a class="dropdown-item item-player" href="#!" onclick="lookupPlayer(1,'${membership.membershipId}', true);"><img class="platIcon" src="https://www.bungie.net/${membership.iconPath}" style="margin-right:10px" />${membership.displayName}</a>`);
                break;
            case 2:
                $("#userBar .dropdown-menu #player-items").append(`<a class="dropdown-item item-player" href="#!" onclick="lookupPlayer(2,'${membership.membershipId}', true);"><img class="platIcon" src="https://www.bungie.net/${membership.iconPath}" style="margin-right:10px" />${membership.displayName}</a>`);
                break;
            case 4:
                $("#userBar .dropdown-menu #player-items").append(`<a class="dropdown-item item-player" href="#!" onclick="lookupPlayer(4,'${membership.membershipId}', true);"><img class="platIcon blizIcon" src="${BLIZ_ICON_URL}" style="margin-right:10px" />${membership.displayName}</a>`);
                break;
            default:
                $("#userBar .dropdown-menu #player-items").append(`<a class="dropdown-item disabled item-player" href="#!">[Unknown Platform]</a>`);
        }
        setTimeout(function () {
            d2API.getGroupsForMember(membership.membershipType, membership.membershipId, 0, 1, function (response) {
                var groups = response.Response;
                if (groups.results.length > 0) {
                    var clan = groups.results[0];
                    if (clan) {
                        clanCount++;
                        $("#userBar .dropdown-menu #clan-items").append(`<a class="dropdown-item item-clan" href="#!" data-clanId="` + clan.group.groupId + `" onclick="lookupClan(\`` + clan.group.name + `\`, true);"><img class="platIcon" src="https://www.bungie.net` + clan.group.avatarPath + `" style="margin-right:10px" />` + clan.group.name + `</a>`);

                        $("#userBar .dropdown-menu #clan-items").slideDown();
                    }
                }
            })
        }, 5);

    });

    $("#userBar .dropdown-menu").append(`<div class="dropdown-divider"></div>`);
    $("#userBar .dropdown-menu").append(`<a class="dropdown-item item-logout" href="#!" onclick="logoutBnet();">Logout</a>`);
    if (clanCount == 0) {
        $("#userBar .dropdown-menu #clan-items").hide();
    }
}

function initBnetAuth() {
    $(`#authLink`).attr(`href`, `https://www.bungie.net/en/OAuth/Authorize?client_id=21640&response_type=code&state=${uuidv4()}&source=bnet`);

    getParams = new URLSearchParams(window.location.search);

    var authAccessToken = Cookies.get(`authAccessToken`);
    var authMembershipID = Cookies.get(`authMembershipID`);
    var authRefreshToken = Cookies.get(`authRefreshToken`);

    var myMemberships;
    var myBNetUser;

    if (!authAccessToken && getParams.has(`code`)) {
        var authCode = getParams.get(`code`);

        setTimeout(function () {
            d2API.requestAuthToken(authCode, function (response) {
                var tokenReq = response;
                if (tokenReq) {
                    authAccessToken = tokenReq.access_token;
                    authMembershipID = tokenReq.membership_id;
                    authRefreshToken = tokenReq.refresh_token;

                    Cookies.set(`authAccessToken`, authAccessToken);
                    Cookies.set(`authRefreshToken`, authRefreshToken);
                    Cookies.set(`authMembershipID`, authMembershipID);

                    window.location.href = window.location.href.split("?")[0];
                } else {
                    $(`#authLink`).show();
                }
            })
        }, 5);


    } else if (authAccessToken) {
        setTimeout(function () {
            d2API.getMembershipDataForCurrentUser(authAccessToken, function (response) {
                var membershipDataReq = response.Response;
                if (membershipDataReq) {
                    myMemberships = membershipDataReq.destinyMemberships;
                    myBNetUser = membershipDataReq.bungieNetUser;
                    $(`#authLink`).hide();
                    loadBNetUser(membershipDataReq);
                } else {
                    Cookies.remove(`authAccessToken`);
                    Cookies.remove(`authRefreshToken`);
                    Cookies.remove(`authMembershipID`);
                    $(`#authLink`).show();
                }
            })
        }, 5);

    } else {
        $(`#authLink`).show();
    }
}

