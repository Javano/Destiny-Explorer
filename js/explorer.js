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
var gearDB;
var ajaxDelay = 30;

$(document).ready(function () {
    enforceDomain();
    initAPIClient();

});

function loadTable(table) {

    $(".table-item").remove();
    var items = worldContentDB.listTable(table);

    $.each(items.values, function (i, v) {
        var item = JSON.parse(v[1]);
        var id = ToUint32(v[0]);
        
        var contentHTML = `<div class="card table-item" style="padding: 15px; white-space: pre-wrap; opacity:0;padding-top: 10px;padding-bottom: 0px;"><div class="card-block">`;
        
        var itemID = uuidv4();
        contentHTML += `<div style="text-align: right; position:relative;">`;
        contentHTML += `<h2 style="display:inline;position:absolute;left:15px;">ID: ${id}</h2>`;

        contentHTML += `<a class="btn btn-secondary" data-toggle="collapse" href="#collapse-${itemID}" aria-expanded="true" aria-controls="collapse-${itemID}" onclick="var newLabel = $(this).attr('data-other-label'); $(this).attr('data-other-label', $(this).text()); $(this).text(newLabel);" data-other-label="+" style="margin-right:7px;margin-bottom:5px">-</a>`;

        contentHTML += `<a class="btn btn-secondary" data-toggle="close" href="#close-${itemID}" aria-expanded="true" aria-controls="close-${itemID}" onclick="closeItem(this)" style="margin-bottom:5px">x</a>`;

        contentHTML += `</div>`;

        contentHTML += `<div id="collapse-${itemID}" class="collapse show" role="tabpanel" aria-labelledby="headingOne" data-parent="#accordion-${itemID}" style="background: #444; border: 2px solid #303030;margin-bottom: 15px;">` +
            `<div class="card-body">`;

        contentHTML += createAccordion(item);

        contentHTML += `</div></div>`;
        contentHTML += `</div></div>`;

        $("#loreDiv").append(contentHTML);
    });


    $(".table-item").each(function (i, v) {
        $(v).delay(10 * i).fadeTo(300, 1);
    });
}
function closeItem(item) {
    $(item).closest('.table-item').fadeTo(300, 0, function () {
        $(item).closest('.table-item').remove();
    });

}
function createAccordion(obj) {

    var contentHTML = "";

    var accordionID = uuidv4();
    contentHTML += `<div id="accordion-${accordionID}" role="tablist"><ul>`;


    for (var key in obj) {
        var value = obj[key];

        var collapseID = uuidv4();


        contentHTML += `<li>`;

        if (typeof value === 'object') {

            contentHTML += `<div class="card" style="margin-left: 0px;border: none;margin-right: 0px;margin-bottom: 0px;">` +
                `<div class="card-header" role="tab" id="headingOne" style="border: none;padding: 5px;padding-left: 0px;">` +
                `<h4 class="mb-0">` +
                `<a data-toggle="collapse" href="#collapse-${collapseID}" aria-expanded="true" aria-controls="collapse-${collapseID}">` +
                `[${key}]` +
                `</a>` +
                `</h4>` +
                `</div>` +
                `</div>`;

            contentHTML += `<div id="collapse-${collapseID}" class="collapse" role="tabpanel" aria-labelledby="headingOne" data-parent="#accordion-${accordionID}" style="background: #444; border: 2px solid #00bc8c;margin-bottom: 15px;">` +
                `<div class="card-body" style="padding: 15px;padding-left: 0;">`;
            contentHTML += createAccordion(value);
            contentHTML += `</div>` +
                `</div>`;

        } else {

            contentHTML += `<h5 style="display:inline">${key}: </h5>`;
            contentHTML += `<h5 style="display:inline">${value}</h5><br>`;
        }

        contentHTML += `</li>`;





    }
    contentHTML += `<ul></div>`;

    return contentHTML;
}


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

        $("#dateDiv").text(`Data Last Updated: ${fetchHeader(`https://www.bungie.net${manifest.mobileWorldContentPaths.en}`, 'Last-Modified')}`);
        worldContentDB = new WorldContentDB(manifest.mobileWorldContentPaths.en, function () {
            var tables = worldContentDB.listTables();

            $.each(tables, function (i, v) {
                var t = v[0];
                $("#navTables ul").append(` <li class="nav-item"><a class="nav-link" href="#!" onclick="loadTable('${t}');">${t}</a></li>`);
            });
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
    $(".table-item").each(function (i, v) {
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
