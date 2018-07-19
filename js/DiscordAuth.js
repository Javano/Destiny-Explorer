function logoutDiscord() {
    Cookies.remove("discord_authAccessToken");
    Cookies.remove("discord_authRefreshToken");
    Cookies.remove("discord_authMembershipID");
    location.reload();
}


function loadDiscordUser(bNetUser) {

    $("#userBar").append(`<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>`);
    $("#userBar button").append(`<img id="userProfilePic" src="https://www.bungie.net/${bNetUser.bungieNetUser.profilePicturePath}"/>`);
    $("#userBar button").append(`<p id="userDisplayName">${bNetUser.bungieNetUser.displayName}</p>`);

    $("#userBar").prepend(`<div id="userDropdown" class="dropdown-menu  dropdown-menu-right" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 68px, 0px); top: 0px; left: 0px; will-change: transform;"><div id="player-items"><h4>My Accounts</h4></div><div id="clan-items"><div class="dropdown-divider"></div><h4>My Clans</h4></div></div>`);

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
            d2APIClient.getGroupsForMember(membership.membershipType, membership.membershipId, 0, 1, function (response) {
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

function initDiscordAuth() {
    $(`#authLink_Discord`).attr(`href`, `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=386997154188886016&state=${uuidv4()}&scope=identify%20email%20rpc.notifications.read%20gdm.join%20connections`);

    getParams = new URLSearchParams();
    var tokenRegEx = /access_token=(\w+)/;
    var matches = tokenRegEx.exec(window.location.hash);
    var authAccessToken = Cookies.get(`discord_authAccessToken`);
    var myMemberships;
    var myBNetUser;

    if (!authAccessToken && matches && matches[1]) {
        authAccessToken = matches[1];

        if (authAccessToken) {

            Cookies.set(`discord_authAccessToken`, authAccessToken);

            window.location.href = window.location.href.split("?")[0];

        } else {
            $(`#authLink_Discord`).show();
        }


    } else if(!authAccessToken){
        $(`#authLink_Discord`).show();
    } 

}

