///  Narco effects


let type = require('type-detect');
let helpers = require('../helpers/model-helper');
let Chance = require('chance');
let chance = new Chance();
let consts = require('../helpers/constants');

function loadNarco(api, id)
{
    return api.getCatalogObject("narco", id.toLowerCase());
}

function createEffectModifier(api, effectName, modifierId) {
    var effect = api.getCatalogObject("effects", effectName);
    
    if (!effect) {
        api.warn("Can't load effect " + effectName);
        return;
    }

    effect.enabled = true;

    var modifier = { 
        id: modifierId,
        name: modifierId,
        displayName: "Воздействие каких-то таблеток",
        class: "narco",
        effects: [ effect ],
        enabled: true,
    };

    return modifier;
}

function addModifierTemporary(api, modifier, duration){
    modifier = api.addModifier(modifier);
    api.debug(modifier);
    helpers().setTimerToKillModifier(api, modifier, duration)
    return modifier;
}

function startTemporaryCubeChange(api, narco)
{    
    api.debug("Narco will add modifier")
    //Изменение должно быть временным. Накладываем эффект

    var modifier = createEffectModifier(api, "change-mind-cube-effect", "narcoEffects");
    if (!modifier)  { return; }

    modifier.mindCubeChange =  narco.mindCubeTemp,
    modifier.pushbackDuration =  narco.mindCubePushbackEnabled ? narco.duration * 100 : 0;

    //Установка модификатора
    addModifierTemporary(api, modifier, narco.duration * 1000 + modifier.pushbackDuration)
}

function addTemporaryConditons(api, narco)
{    
    api.debug("Narco will add modifier")

    let modifier = createEffectModifier(api, "show-always-condition", "narcoEffectsCondition");
    if (!modifier)  { return; }

    modifier.conditions = narco.conditions;

    addModifierTemporary(api, modifier, narco.duration * 1000)
}

function canAscend(api)
{
    let genome = api.model.genome;
    return (genome && genome["Z2"] == 0 && genomre["Z7"] == 3 && genome["Z10"] == 3 && genome["Z12"] == 3);
}

function performAscend(api)
{
    api.info("ASCENDING NOW ***** ******");

    let modifier = createEffectModifier(api, "show-always-condition", "narcoAscendCondition");
    if (!modifier) {return;}

    modifier.conditions = ["ascend-condtion"];

    //TODO: add 2 max hp
    
    modifier = api.addModifier(modifier);
    api.debug(modifier);
}

function dieHorribleDeath(api) {
    api.warn("Death is not a option. for now..");
}

function applyNarcoEffect(api, data, event)
{
    api.info(`Taking narco effect: ${event.data}`);
    let narco = loadNarco(api, event.data);
    api.debug(JSON.stringify(narco));
    if (narco.mindCubePermanent)
        {
            //Изменение должно быть постоянным. Меняем базовую модель
            helpers().modifyMindCubes(api, api.model.mind, narco.mindCubePermanent);
        }
    
    if (narco.mindCubeTemp)
        {
            //Изменение должно быть временным. Накладываем эффект
            startTemporaryCubeChange(api, narco);
        }

    if (narco.conditions)
        {
            addTemporaryConditons(api, narco);
        }

    if (narco.magicAscend) {
        if (canAscend(api)) {
            performAscend(api);
        } else {
            dieHorribleDeath(api);
        }
    }
    
    narco.history_record = narco.history_record || 'Вы приняли таблетку.';
    
    api.debug("Narco will add history record " + narco.history_record)
    helpers().addChangeRecord(api, narco.history_record, event.timestamp);       
}

/**
 * Remove narco modifier by id
 */
function removeNarcoEffect(api, data, event)
{
    api.info(`Removing narco effect ${data.mID}`)
    if(data.mID){
        let modifier = api.getModifierById(data.mID);
        if(modifier){
            api.removeModifier(data.mID);
        }
    }
}

module.exports = () => {
    return {
        applyNarcoEffect,
        removeNarcoEffect
    };
};