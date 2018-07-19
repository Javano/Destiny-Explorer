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
var activityDict = [];
var faves = [];

var DISCORD_CLIENT;

$(document).ready(function () {
    initDiscordAuth();
    if (Cookies.get(`discord_authAccessToken`)) {
        initDiscordAPIClient();
    }
});


function initDiscordAPIClient() {

    var accessToken = Cookies.get(`discord_authAccessToken`);
    DISCORD_CLIENT = new Discord.Client({
        token: accessToken,
        autorun: false
    });

    DISCORD_CLIENT.on('ready', function () {
        console.log("%s (%s)... in the browser!",  DISCORD_CLIENT.username,  DISCORD_CLIENT.id);
    });
    DISCORD_CLIENT.on('message', function (user, userID, channelID, message, event) {
        if (message === 'ping') {
            client.sendMessage({
                to: userID,
                message: "pong"
            });
        }
    });

    DISCORD_CLIENT.connect();

}


$("#lfm-chkDiscord").change(
    function(){
        if (this.checked) {
            $("#lfm-discord").slideDown();
        } else {
            
            $("#lfm-discord").slideUp();
        }
    });