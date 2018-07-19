function GearDB(dbURI, callback = null) {

    var db;

    loadDB(dbURI, function (newDB) {
        db = newDB;
        if (callback) {
            callback();
        }
    });

    this.lookupGear = function (hash = null) { return this.lookup("DestinyGearAssetsDefinition", hash) };

    this.lookupActivityGraph = function (hash = null) { return this.lookup("DestinyActivityGraphDefinition", hash) };

    this.lookupActivityMode = function (hash = null) { return this.lookup("DestinyActivityModeDefinition", hash) };

    this.lookupActivityModifier = function (hash = null) { return this.lookup("DestinyActivityModifierDefinition", hash) };

    this.lookupActivityType = function (hash = null) { return this.lookup("DestinyActivityTypeDefinition", hash) };

    this.lookupBond = function (hash = null) { return this.lookup("DestinyBondDefinition", hash) };

    this.lookupClass = function (hash = null) { return this.lookup("DestinyClassDefinition", hash) };

    this.lookupDestination = function (hash = null) { return this.lookup("DestinyDestinationDefinition", hash) };

    this.lookupEnemyRace = function (hash = null) { return this.lookup("DestinyEnemyRaceDefinition", hash) };

    this.lookupFaction = function (hash = null) { return this.lookup("DestinyFactionDefinition", hash) };

    this.lookupGender = function (hash = null) { return this.lookup("DestinyGenderDefinition", hash) };

    this.lookupHistoricalStats = function (hash = null) { return this.lookup("DestinyHistoricalStatsDefinition", hash) };

    this.lookupInventoryBucket = function (hash = null) { return this.lookup("DestinyInventoryBucketDefinition", hash) };

    this.lookupInventoryItem = function (hash = null) { return this.lookup("DestinyInventoryItemDefinition", hash) };

    this.lookupItemCategory = function (hash = null) { return this.lookup("DestinyItemCategoryDefinition", hash) };

    this.lookupItemTierType = function (hash = null) { return this.lookup("DestinyItemTierTypeDefinition", hash) };

    this.lookupLore = function (hash = null) { return this.lookup("DestinyLoreDefinition", hash) };

    this.lookupMedalTier = function (hash = null) { return this.lookup("DestinyMedalTierDefinition", hash) };

    this.lookupMilestone = function (hash = null) { return this.lookup("DestinyMilestoneDefinition", hash) };

    this.lookupObjective = function (hash = null) { return this.lookup("DestinyObjectiveDefinition", hash) };

    this.lookupPlace = function (hash = null) { return this.lookup("DestinyPlaceDefinition", hash) };

    this.lookupProgression = function (hash = null) { return this.lookup("DestinyProgressionDefinition", hash) };

    this.lookupProgressionLevelRequirement = function (hash = null) { return this.lookup("DestinyProgressionLevelRequirementDefinition", hash) };

    this.lookupRace = function (hash = null) { return this.lookup("DestinyRaceDefinition", hash) };

    this.lookupReportReasonCategory = function (hash = null) { return this.lookup("DestinyReportReasonCategoryDefinition", hash) };

    this.lookupRewardSource = function (hash = null) { return this.lookup("DestinyRewardSourceDefinition", hash) };

    this.lookupSackRewardItemList = function (hash = null) { return this.lookup("DestinySackRewardItemListDefinition", hash) };

    this.lookupSandboxPerk = function (hash = null) { return this.lookup("DestinySandboxPerkDefinition", hash) };

    this.lookupSocketCategory = function (hash = null) { return this.lookup("DestinySocketCategoryDefinition", hash) };

    this.lookupSocketType = function (hash = null) { return this.lookup("DestinySocketTypeDefinition", hash) };

    this.lookupStat = function (hash = null) { return this.lookup("DestinyStatDefinition", hash) };

    this.lookupStatGroup = function (hash = null) { return this.lookup("DestinyStatGroupDefinition", hash) };

    this.lookupTalentGrid = function (hash = null) { return this.lookup("DestinyTalentGridDefinition", hash) };

    this.lookupUnlock = function (hash = null) { return this.lookup("DestinyUnlockDefinition", hash) };

    this.lookupVendorCategory = function (hash = null) { return this.lookup("DestinyVendorCategoryDefinition", hash) };

    this.lookupVendor = function (hash = null) { return this.lookup("DestinyVendorDefinition", hash) };

    this.lookup = function (definition, hash = null) {
        var retval = [];

        var queryStr = `Select json From ${definition}`;
        if (hash) {
            queryStr += ` WHERE id = '${ToInt32(hash)}'`;
        }
        queryStr += `;`;

        var contents = db.exec(queryStr);
        if (contents[0]) {
            retval = contents[0].values;
        }
        return retval;
    }


    this.listTables = function () {
        var retval = [];

        var queryStr = `SELECT name FROM sqlite_master WHERE type = "table";`;

        var contents = db.exec(queryStr);

        if (contents[0]) {
            retval = contents[0].values;
        }

        return retval;
    }

    this.listTable = function (table) {
        var retval = [];

        var queryStr = `Select * From ${table};`;

        var contents = db.exec(queryStr);
        if (contents[0]) {
            retval = contents[0];
        }
        return retval;
    }

}
function loadGearDB(dbURI, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.bungie.net${dbURI}`, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {

        zip.createReader(new zip.BlobReader(this.response), function (reader) {
            reader.getEntries(function (entries) {
                if (entries.length) {
                    entries[0].getData(new zip.BlobWriter(), function (blob) {

                        var arrayBuffer;
                        var fileReader = new FileReader();
                        fileReader.onload = function () {
                            arrayBuffer = this.result;
                            var uInt8Array = new Uint8Array(arrayBuffer);
                            callback(new SQL.Database(uInt8Array));
                        };
                        fileReader.readAsArrayBuffer(blob);
                        reader.close(function () {
                        });

                    }, function (current, total) {
                    });
                }
            });
        }, function (error) {
        });

    };
    xhr.send();
}