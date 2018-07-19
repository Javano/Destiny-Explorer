

var version = "1.01";
var datestamp = "April 12th, 2018";

var d2APIClient;
var API_CONFIG = {
    apikey: `179275df5e5847ad8797e18756417505`,
    oauthConfig: {
        id: `21640`,
        secret: `ncyNDQEF09DKw.BI01jIdlAtobB1Cz8EXX1gxzjiPQ8`
    }
};
var CLASS_ENUM = [`Titan`, `Hunter`, `Warlock`];
var GENDER_ENUM = [`Male`, `Female`, `Unknown`];
var RACE_ENUM = [`Human`, `Awoken`, `Exo`, `Unknown`];
var BLIZ_ICON_URL = `img/icon_bliz.png`;
var XBOX_ICON_URL = `img/icon_xbl.png`;
var PSN_ICON_URL = `img/icon_psn.png`;
var PLATS = ["XB1", "PS4", "0", "PC"];
var faves = [];
var worldContentDB;
var ajaxDelay = 30;

$(document).ready(function () {
        //Update version label 
        $("#versionNum").text(`v${version}`).attr("title", datestamp).tooltip();
    enforceDomain();
    initAPIClient();
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar, #content').toggleClass('active');
        $('.collapse.in').toggleClass('in');
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');

        $('#sidebarCollapse').toggle();
    });

    $('#sidebar .close').on('click', function () {

        $('#sidebarCollapse').click();
    });
});

function fetchHeader(url, wch) {
    try {
        var req = new XMLHttpRequest();
        req.open("HEAD", url, false);
        req.send(null);
        if (req.status == 200) {
            return req.getResponseHeader(wch);
        }
        else return false;
    } catch (er) {
        return er.message;
    }
}


function initAPIClient() {
    d2APIClient = new Destiny2API({
        key: API_CONFIG.apikey,
        oauthConfig: API_CONFIG.oauthConfig
    });


    var manifest = d2APIClient.getManifest().Response;
    if (manifest && manifest.version) {

        $("#dateDiv").text(`Lore Last Updated: ${fetchHeader(`https://www.bungie.net${manifest.mobileWorldContentPaths.en}`, 'Last-Modified')}`);
        worldContentDB = new WorldContentDB(manifest.mobileWorldContentPaths.en, function () {
            var lore = worldContentDB.lookupLore();

            $('#loadingPanel').fadeOut();
            

            $('#sidebar, #content').toggleClass('active');
            $('#sidebar').show();
            $('#topBar').fadeIn();
            $('#dateDiv').fadeIn();
            $('#sidebarCollapse').fadeIn();

            $('#loadedContentPanel').slideDown();

            setTimeout(function () {
                $.each(lore, function (i, v) {

                    var l = JSON.parse(v[0]);
                    if (l.displayProperties.name && l.displayProperties.name != "Classified" && l.displayProperties.description) {


                        $("#loreDiv").append(`<div class="card panel lore-item" style="padding: 20px; opacity:0;white-space: pre-wrap;"><div class="texturedPanel glass"></div><div class="card-block"><h4 class="card-title" style="color:#00bc8c;">${l.displayProperties.name}</h4><h5 class="card-subtitle text-muted" style="padding: 5px;padding-bottom: 15px;">${l.subtitle}</h5><p class="card-text">${l.displayProperties.description}</p></div></div>`);
                    }
                });


                $(".lore-item").each(function (i, v) {
                    $(v).delay(10 * i).fadeTo(300, 1);
                });
            }, 1000);

        });

    }


    $(`#UserNameTxt`).on(`keyup`, function (e) {
        if (e.keyCode == 13) {
            $(`#UserSubmitBtn`).click();
        }
    });



}
$(`#UserSubmitBtn`).click(function () {
    clearHighlights();
    filterLoreItems($(`#UserNameTxt`).val().trim());
});

function clearHighlights() {
    $(".highlight").each(function (i, v) {
        v.outerHTML = $(v).text();

    });
}

function filterLoreItems(str) {
    $(".lore-item").each(function (i, v) {
        if (!$(v).text().toUpperCase().includes(str.toUpperCase())) {
            $(v).slideUp();
        } else {
            $(v).slideDown();

            if (str) {
                var html = $(v).html();

                var strRegEx = new RegExp(str, 'gi');
                var result;
                var indices = [];
                while ((result = strRegEx.exec(html))) {
                    indices.push(result.index);
                }
                indices.reverse();

                for (var i = 0; i < indices.length; i++) {
                    var index = indices[i];
                    html = html.substr(0, index) + `<span class="highlight">` + html.substr(index, str.length) + `</span>` + html.substr(index + str.length);

                }


                $(v).html(html);
            }
        }
    });
}
