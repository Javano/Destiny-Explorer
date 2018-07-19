
var faves = [];

function hasFav(name, platform) {
    var isFaved = false;
    if (faves) {
        $.each(faves, function (i, f) {
            if (f.displayName == name && f.membershipType == platform) {

                isFaved = i + 1;
            }
        });
    }

    return isFaved;
}

function favUser(name, platform, id) {

    var favI = hasFav(name, platform);
    if (!favI) {
        faves.push({ displayName: name, membershipType: platform, membershipId: id });
    } else {
        faves.splice(favI - 1, 1);
    }

    Cookies.set("favorite-users", JSON.stringify(faves))
}

function clearFaves() {
    faves = [];
    Cookies.remove("favorite-users");
    $("#favesBar").slideUp();
    $("#userBar").css("right", "20px");
}

function initFaves() {
    var favCookie = Cookies.get(`favorite-users`);
    if (favCookie) {
        faves = JSON.parse(favCookie);
    }
    $("#favesBar").append(`<button class="btn btn-secondary glass" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ></button>`);
    $("#favesBar button").append(`<p id="favesIcon"><i class="fa fa-star-o" aria-hidden="true"></i></p>`);

    $("#favesBar").append(`<div id="favesDropdown" class="dropdown-menu  dropdown-menu-right" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; transform: translate3d(0px, 68px, 0px); top: 0px; left: 0px; will-change: transform;"><div id="fav-items"><h4>My Favorites</h4></div></div>`);

    if (faves.length) {
        $.each(faves, function (index, fav) {
            var iconHTML = "";
            switch (fav.membershipType) {
                case '1':
                    iconHTML = `<img class="platIcon" src="${XBOX_ICON_URL}" style="margin-right:10px" />`;
                    break;
                case '2':
                    iconHTML = `<img class="platIcon" src="${PSN_ICON_URL}" style="margin-right:10px" />`;
                    break;
                case '4':
                    iconHTML = `<img class="blizIcon platIcon" src="${BLIZ_ICON_URL}" style="margin-right:10px" />`;
                    break;
            }
            $("#favesBar .dropdown-menu").append(`<a class="dropdown-item item-fav" href="#!" onclick="lookupPlayer(${fav.membershipType}, '${fav.membershipId}', true);">${iconHTML}${fav.displayName}</a>`);
        });
        
        $('#favesBar').slideDown();
    } else {
        $("#favesBar").hide();
        $("#userBar").css("right", "20px");
    }
    $("#favesBar .dropdown-menu").append(`<div class="dropdown-divider"></div><a class="dropdown-item item-fav" href="#!" onclick="clearFaves();">Clear Favorites</a>`);

}

function toggleFavBtn(button) {
    var newValue;

    if ($(button).hasClass("faved")) {
        $(button).removeClass("faved");
        newValue = "Favorite User";
        $(button).html(`<i class="fa fa-star-o" aria-hidden="true"></i>`);
    } else {

        $(button).addClass("faved");
        newValue = "Unfavorite User";
        $(button).html(`<i class="fa fa-star-o" aria-hidden="true"></i>`);
    }

    $(button).tooltip('hide')
        .attr('data-original-title', newValue)
        .tooltip('fixTitle')
        .tooltip('show');

};