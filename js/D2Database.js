function D2Database(callback = null) {

    var manifest;
    var items = [];
    var raw = [];
    var diff = [];
    $.getJSON(`https://destiny.plumbing/`, function (response) {

        manifest = response.en;
        raw = manifest.raw;
        diff = manifest.diff;


        $.getJSON(manifest.reducedCollectableInventoryItems, function (itemResp) {
            items = itemResp;

            var thingsToLoad = [
                "DestinyActivityDefinition",
                "DestinyFactionDefinition",
                "DestinyProgressionDefinition"
            ];
            var thingsLoaded = 0;
            $.each(thingsToLoad, function (i, v) {

                $.getJSON(raw[v], function (resp) {
                    raw[v] = resp;
                    thingsLoaded++;
                    if (thingsLoaded >= thingsToLoad.length && callback) {
                        callback();
                    }
                });
            });
        });







        /* LOAD ALL THE THINGS 
                var thingsToLoad = 0;
                var thingsLoaded = 0;
                for (var def in raw) {
                    thingsToLoad++;
                    $.getJSON(raw[def], function (resp) {
                        raw[def] = resp;
                        thingsLoaded++;
                        if (thingsLoaded >= thingsToLoad && callback) {
                            callback();
                        }
                    });
        
                }
                **/
    });

    this.lookupItem = function (hash = null) { return items[hash] };

    this.lookupActivity = function (hash = null) { return this.lookup("DestinyActivityDefinition", hash) };

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
        var retVals = [];
        if (hash) {
            retVals.push(raw[definition][hash]);
        } else {
            retVals = raw[definition];
        }


        return retVals;
    }

}
