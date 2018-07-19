/**
 * API Wrapper for Destiny 2, built with Node.js
 * @author Brandon Manke
 */


function Destiny2API(config) {
    this.host = 'https://www.bungie.net';
    this.api = `https://www.bungie.net/Platform/Destiny2`;
    this.path_Destiny2 = '/Platform/Destiny2';
    this.path_GroupV2 = '/Platform/GroupV2';
    this.path_User = '/Platform/User';
    this.path_App = '/Platform/App';
    this.key = config.key;
    this.userAgent = config.userAgent;
    this.oauthConfig = {
        id: config.oauthConfig.id,
        secret: config.oauthConfig.secret
    } || {};
    this.options = {
        host: this.host,
        path: '',
        method: '',
        headers: {
            'User-Agent': this.userAgent,
            'X-API-Key': this.key
        },
        contentType: "application/json",
        data: {}
    }
    this.sendRequestAsync = async function (callback = null, host = this.options.host) {
        var headers = this.options.headers;
        $.ajax({
            async: false, beforeSend: function (request) {

                if (headers["Authorization"]) {
                    request.setRequestHeader("Authorization", headers["Authorization"]);
                }

                request.setRequestHeader("X-API-Key", headers["X-API-Key"]);
            }, url: host + this.options.path, type: this.options.method, data: this.options.data, success: function (result) { if (callback) { callback(result); } }, error: function (result) { if (callback) { callback(result); } }
        });
        this.options.data = {};
    }
    this.sendRequest = function () {
        var response = "";
        var headers = this.options.headers;
        $.ajax({
            async: false, beforeSend: function (request) {

                if (headers["Authorization"]) {
                    request.setRequestHeader("Authorization", headers["Authorization"]);
                }

                request.setRequestHeader("X-API-Key", headers["X-API-Key"]);
            }, url: this.options.host + this.options.path, type: this.options.method, data: this.options.data, success: function (result) {
                response = result;
            }
        });
        this.options.data = {};
        return response;
    }

    /**
     * Async GetBungieApplications
     */
    this.getBungieApplications = function (callback = null) {
        this.options.path = `${this.path_App}/FirstParty/`;
        this.options.method = 'GET';

        if (callback) {
            return this.sendRequestAsync(callback);
        } else {
            return this.sendRequest();
        }
    }

    /**
     * Async GetApplicationApiUsage
     */
    this.getApplicationApiUsage = function (applicationId, callback = null) {
        this.options.path = `${this.path_App}/ApiUsage/${applicationId}/ `;
        this.options.method = 'GET';

        if (callback) {
            return this.sendRequestAsync(callback);
        } else {
            return this.sendRequest();
        }
    }

    /**
     * Async GetManifest
     * Links to sqlite database file, so I don't really know how to handle this
     */
    this.getManifest = function (callback = null) {
        this.options.path = `${this.path_Destiny2}/Manifest/`;
        this.options.method = 'GET';

        if (callback) {
            return this.sendRequestAsync(callback);
        } else {
            return this.sendRequest();
        }
    }
    /**
 * Async 
 * 
 */
    this.awaInitializeRequest = function (callback) {
        this.options.path = `${this.path_Destiny2}/Awa/Initialize/`;
        this.options.method = 'POST';
        //    this.options.headers["Authorization"] = "Bearer " + token;
        /*    this.options.data = {
                grant_type: "authorization_code",
                code: this.oauthConfig.secret
            };*/

        return this.sendRequestAsync(callback);
    }
    /**
 * Async 
 * 
 */
    this.getGroupsForMember = function (membershipType, membershipId, filter, groupType, callback) {
        this.options.path = `${this.path_GroupV2}/User/${membershipType}/${membershipId}/${filter}/${groupType}/`;
        this.options.method = 'GET';
        //    this.options.headers["Authorization"] = "Bearer " + token;
        /*    this.options.data = {
                grant_type: "authorization_code",
                code: this.oauthConfig.secret
            };*/

        return this.sendRequestAsync(callback);
    }


    /**
 * Async 
 * 
 */
    this.getGroup = function (groupId, callback) {
        this.options.path = `${this.path_GroupV2}/${groupId}/`;
        this.options.method = 'GET';
        //    this.options.headers["Authorization"] = "Bearer " + token;
        /*    this.options.data = {
                grant_type: "authorization_code",
                code: this.oauthConfig.secret
            };*/

        return this.sendRequestAsync(callback);
    }


    /**
 * Async 
 * 
 */
    this.getMembersOfGroup = function (groupId, memberType = 0, nameSearch = "", currentpage = 1, callback) {
        this.options.path = `${this.path_GroupV2}/${groupId}/Members/`;
        this.options.method = 'GET';
        //    this.options.headers["Authorization"] = "Bearer " + token;
        this.options.data = {
            memberType: memberType,
            nameSearch: nameSearch,
            currentpage: currentpage
        };

        return this.sendRequestAsync(callback);
    }

    /**
 * Async 
 * 
 */
    this.getAdminsAndFounderOfGroup = function (groupId, callback) {
        this.options.path = `${this.path_GroupV2}/${groupId}/AdminsAndFounder/`;
        this.options.method = 'GET';
        //    this.options.headers["Authorization"] = "Bearer " + token;
        /*    this.options.data = {
                memberType: memberType,
                nameSearch: nameSearch
            };*/

        return this.sendRequestAsync(callback);
    }

    /**
* Async 
* 
*/
    this.getPendingMemberships = function (groupId, callback) {
        this.options.path = `${this.path_GroupV2}/${groupId}/Members/Pending/`;
        this.options.method = 'GET';
        //     this.options.headers["Authorization"] = "Bearer " + token;
        this.options.data = {
            grant_type: "authorization_code",
            code: this.oauthConfig.secret
        };
        return this.sendRequestAsync(callback);
    }


    /**
* Async 
* 
*/
    this.approvePending = function (groupId, membershipType, membershipId, callback) {
        this.options.path = `${this.path_GroupV2}/${groupId}/Members/Approve/${membershipType}/${membershipId}/`;
        this.options.method = 'POST';
        this.options.data = JSON.stringify({"message": "You've been approved!"});
    return this.sendRequestAsync(callback);
}



/**
* Async 
* 
*/
this.approveAllPending = function (groupId, callback) {
    this.options.path = `${this.path_GroupV2}/${groupId}/Members/ApproveAll/`;
    this.options.method = 'POST';
    this.options.data = JSON.stringify({"message": "You've been approved!"});
    return this.sendRequestAsync(callback);
}

/**
* Async 
* 
*/
this.denyAllPending = function (groupId, callback) {
    this.options.path = `${this.path_GroupV2}/${groupId}/Members/DenyAll/`;
    this.options.method = 'POST';
    this.options.data = JSON.stringify({"message": "You've been denied!"});
    return this.sendRequestAsync(callback);
}

/**
* Async 
* 
*/
this.requestAuth = function (callback) {
    this.options.path = `/en/OAuth/Authorize?client_id=${this.oauthConfig.id}&response_type=code&state=9999999999`;
    this.options.method = 'GET';
    this.options.data = {
        grant_type: "authorization_code",
        code: this.oauthConfig.secret
    };
    return this.sendRequestAsync(callback);
}
/**
* Async 
* 
*/
this.requestAuthToken = function (authCode, callback) {
    this.options.path = `/Platform/App/OAuth/Token/`;
    this.options.method = 'POST';
    this.options.data = {
        client_id: this.oauthConfig.id,
        client_secret: this.oauthConfig.secret,
        grant_type: "authorization_code",
        code: authCode
    };
    return this.sendRequestAsync(callback);
}

/**
* Async 
* 
*/
this.getClan = function (groupName, groupType, callback) {
    this.options.path = `${this.path_GroupV2}/Name/${encodeURIComponent(groupName)}/${groupType}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}
/**
* Async 
* 
*/
this.getClanMembers = function (groupId, callback) {
    this.options.path = `${this.path_GroupV2}/${groupId}/Members/1`;
    this.options.method = 'GET';
    this.options.data = {
        memberType: "None",
        nameSearch: "None"
    }
    return this.sendRequestAsync(callback);
}


/**
* Async GetMembershipDataForCurrentUser
* 
*/
this.getMembershipDataForCurrentUser = function (token, callback) {
    this.options.path = `${this.path_User}/GetMembershipsForCurrentUser/`;
    this.options.method = 'GET';
    this.options.headers["Authorization"] = "Bearer " + token;
    this.options.data = {
        grant_type: "authorization_code",
        code: this.oauthConfig.secret
    };

    return this.sendRequestAsync(callback);
}



/**
* Async GetMembershipsById
* 
*/
this.getMembershipsById = function (membershipType, membershipId, callback) {
    this.options.path = `${this.path_User}/GetMembershipsById/${membershipId}/${membershipType}/ `;
    this.options.method = 'GET';

    return this.sendRequestAsync(callback);
}



/**
* Async 
* 
*/
this.searchClan = function (groupName, callback) {
    this.options.path = `${this.path_GroupV2}/Search/`;
    this.options.method = 'POST';
    this.options.data = {
        name: groupName
    };
    return this.sendRequestAsync(callback);
}
/**
 * 
 */
this.getDestinyEntityDefinition = function (typeDefinition, hashIdentifier, callback) {
    this.options.path = `${this.path_Destiny2}/Manifest/${typeDefinition}/${hashIdentifier}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

this.searchPlayer = function (membershipType, displayName, callback) {
    this.options.path = `${this.path_Destiny2}/SearchDestinyPlayer/${membershipType}/${encodeURIComponent(displayName)}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * Get bungie net profile, based on membership id and filter by membership type
 * ** This 404 as of right now **
 */
this.getProfile = async function (membershipType, destinyMembershipId, callback, components = 'Profiles, Characters, CharacterProgressions, CharacterEquipment') {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Profile/${destinyMembershipId}/`;
    this.options.method = 'GET';
    this.options.data = {
        components: components
    };
    return this.sendRequestAsync(callback);
}

this.getCharacter = function (membershipType, destinyMembershipId, characterId, callback, components = 'Characters, CharacterProgressions, CharacterEquipment') {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Profile/${destinyMembershipId}/character/${characterId}/`;
    this.options.method = 'GET';
    this.options.data = {
        components: components
    };

    return this.sendRequestAsync(callback);
}

this.getClanWeeklyRewardState = function (groupId, callback) {
    this.options.path = `${this.path_Destiny2}/Clan/${groupId}/WeeklyRewardState/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

this.getItem = function (membershipType, destinyMembershipId, itemInstanceId) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Profile/${destinyMembershipId}/Item/${itemInstanceId}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is not active as of yet
 * Get available vendors info
 */
this.getVendors = function (membershipType, destinyMembershipId, characterId, callback, components = "400, 401, 402") {
    this.options.path =
        `${this.path_Destiny2}/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/Vendors/`;
    this.options.method = 'GET';
    this.options.data = {
        components: components
    };
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is not active as of yet
 * Get specific vendor info based on vendorHash
 */
this.getVendor = function (membershipType, destinyMembershipId, characterId, vendorHash, callback, components = "400, 401, 402") {
    this.options.path =
        `${this.path_Destiny2}/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/Vendors/${vendorHash}/`;
    this.options.method = 'GET';    
    this.options.data = {
        components: components
    };
    return this.sendRequestAsync(callback);
}

/*  TODO post requests, some seem to need oauth, 
 *  also TODO maybe change how promise requests works because a lot of copy pasting
 *   
 *   POST: /Destiny2/Actions/Items/TransferItem/
 *   POST: /Destiny2/Actions/Items/EquipItem/
 *   POST: /Destiny2/Actions/Items/EquipItems/
 *   POST: /Destiny2/Actions/Items/SetLockState/
 *   POST: /Destiny2/Actions/Items/InsertSocketPlug/ Preview - Not Ready for Release
 *   POST: /Destiny2/Actions/Items/ActivateTalentNode/ Preview - Not Ready for Release 
 */

this.getPostGameCarnageReport = function (activityId, callback) {
    this.options.path = `${this.path_Destiny2}/Stats/PostGameCarnageReport/${activityId}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

this.getHistoricalStatsDefinition = function (callback) {
    this.options.path = `${this.path_Destiny2}/Stats/Definition/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getClanLeaderboards = function (groupId, callback) {
    this.options.path = `${this.path_Destiny2}/Stats/Leaderboards/Clans/${groupId}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getClanAggregateStats = function (groupId, callback) {
    this.options.path = `${this.path_Destiny2}/Stats/AggregateClanStats/${groupId}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getLeaderboards = function (membershipType, destinyMembershipId, callback, maxtop = 10, modes = "AllPvP, AllPvE", statid = "0") {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Stats/Leaderboards/`;
    this.options.method = 'GET';

    this.options.data = {
        maxtop: maxtop,
        modes: modes,
        statid: statid
    }

    return this.sendRequestAsync(callback);

}

/**
 * This endpoint is still in beta
 */
this.getLeaderboardsForCharacter = function (membershipType, destinyMembershipId, characterId, callback, maxtop = 100, modes = "AllPvP, AllPvE", statid = "") {
    this.options.path = `${this.path_Destiny2}/Stats/Leaderboards/${membershipType}/${destinyMembershipId}/${characterId}/`;
    this.options.method = 'GET';
    this.options.data = {
        maxtop: maxtop,
        modes: modes,
        statid: statid
    }
    return this.sendRequestAsync(callback);
}

this.searchDestinyEntities = function (type, searchTerm, callback) {
    this.options.path = `${this.path_Destiny2}/Armory/Search/${type}/${searchTerm}/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/** 
 * This endpoint is still in beta
 */
this.getHistoricalStats = function (membershipType, destinyMembershipId, characterId, callback) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/`;
    this.options.method = 'GET';
    this.options.data = {
        groups: "0",
        modes: 'TrialsOfTheNine, Raid, AllPvE, Nightfall, AllStrikes, AllPvP, IronBanner'
    };
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getHistoricalStatsForAccount = function (membershipType, destinyMembershipId, callback) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Stats/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getActivityHistory = function (membershipType, destinyMembershipId, characterId) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/Activities/`;
    this.options.method = 'GET';
    return this.sendRequest();
}

/**
 * This endpoint is still in beta
 */
this.getUniqueWeaponHistory = function (membershipType, destinyMembershipId, characterId, callback) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/UniqueWeapons/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

/**
 * This endpoint is still in beta
 */
this.getDestinyAggregateActivityStats = function (membershipType, destinyMembershipId, characterId) {
    this.options.path = `${this.path_Destiny2}/${membershipType}/Account/${destinyMembershipId}/Character/${characterId}/Stats/AggregateActivityStats/`;
    this.options.method = 'GET';
    return this.sendRequest();
}

this.getPublicMilestoneContent = function (milestoneHash, callback) {
    this.options.path = `${this.path_Destiny2}/Milestones/${milestoneHash}/Content/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}

this.getPublicMilestones = function (callback) {
    this.options.path = `${this.path_Destiny2}/Milestones/`;
    this.options.method = 'GET';
    return this.sendRequestAsync(callback);
}


this.getXur = function (callback) {
    $.getJSON(`https://api.destiny.plumbing/xur`, callback);
}
}

