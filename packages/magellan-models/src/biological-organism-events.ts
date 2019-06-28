import { Condition, Effect, Event, Modifier, ModelApiInterface } from 'alice-model-engine-api';
import uuid = require('uuid/v1');
import {
  allSystemsIndices,
  colorOfChange,
  OrganismModel,
  MagellanModelApiInterface,
  organismSystemsIndices,
  SystemColor,
  systemCorrespondsToColor,
  XenoDisease,
} from '../helpers/basic-types';
import consts = require('../helpers/constants');
import helpers = require('../helpers/model-helper');
import { getSymptoms, getSymptomValue, Symptoms } from '../helpers/symptoms';

function updateIsAlive(model: OrganismModel) {
  if (getSymptoms(model).has(Symptoms.Death)) model.isAlive = false;
}

function modifySystemsInstant(api: MagellanModelApiInterface, data: number[], event: Event) {
  if (!api.model.isAlive) return;

  helpers.addChangeRecord(api, 'Состояние систем организма изменилось!', event.timestamp);

  for (const i of organismSystemsIndices(api.model)) {
    if (data[i] != 0) {
      api.model.systems[i].value += data[i];
      api.model.systems[i].lastModified = event.timestamp;
    }
  }

  updateIsAlive(api.model);
}

function modifyNucleotideInstant(api: MagellanModelApiInterface, data: number[], _event: Event) {
  if (!api.model.isAlive) return;

  for (const i of organismSystemsIndices(api.model)) {
    if (data[i] != 0) {
      api.model.systems[i].nucleotide += data[i];
    }
  }

  updateIsAlive(api.model);
}

interface PreMutationData {
  mutationColor: SystemColor;
  diseaseStartTimestamp: number;
}

interface DiseaseTickData {
  systemsModification: number[];
  // Only set for the last tick and only if initial change is single-colored
  preMutationData?: PreMutationData;
}

function diseaseTick(api: MagellanModelApiInterface, data: DiseaseTickData, event: Event) {
  modifySystemsInstant(api, data.systemsModification, event);
  const preMutationData = data.preMutationData;
  if (preMutationData) {
    const mutationData: MutationData = {
      color: preMutationData.mutationColor,
      diseaseStartTimestamp: preMutationData.diseaseStartTimestamp,
      newNucleotideValues: allSystemsIndices().map((i) => {
        if (!api.model.systems[i].present) return undefined;
        if (!systemCorrespondsToColor(preMutationData.mutationColor, i)) return undefined;
        return api.model.systems[i].nucleotide + getSymptomValue(api.model.systems[i]);
      }),
    };
    api.setTimer(uuid(), consts.MAGELLAN_TICK_MILLISECONDS, 'mutation', mutationData);
  }
}

interface MutationData {
  color: SystemColor;
  diseaseStartTimestamp: number;
  newNucleotideValues: Array<number | undefined>;
}

function mutation(api: MagellanModelApiInterface, data: MutationData, _event: Event) {
  if (!api.model.isAlive) return;

  for (const i of organismSystemsIndices(api.model)) {
    if (!systemCorrespondsToColor(data.color, i) && api.model.systems[i].lastModified >= data.diseaseStartTimestamp) return; // Cancel mutation due to the change in the system of incompatible color
  }

  for (const i of organismSystemsIndices(api.model)) {
    const newValueOrUndefined = data.newNucleotideValues[i];
    if (newValueOrUndefined != undefined) {
      api.model.systems[i].nucleotide = newValueOrUndefined;
    }
  }

  updateIsAlive(api.model);
}

function biologicalSystemsInfluence(api: MagellanModelApiInterface, totalChange: number[], event: Event) {
  const totalTicks = Math.max(...totalChange.map((v) => Math.abs(v)));
  for (let i = 0; i < totalTicks; ++i) {
    const adjustment = totalChange.map((v) => {
      if (Math.abs(v) <= i) return 0;
      return Math.sign(v);
    });
    const tickData: DiseaseTickData = { systemsModification: adjustment };
    if (i == totalTicks - 1) {
      const color = colorOfChange(api.model, totalChange);
      if (color != undefined) {
        tickData.preMutationData = {
          mutationColor: color,
          diseaseStartTimestamp: event.timestamp,
        };
      }
    }

    api.setTimer(uuid(), i * consts.MAGELLAN_TICK_MILLISECONDS, 'disease-tick', tickData);
  }
}

function xenoDisease(api: MagellanModelApiInterface, data: XenoDisease, event: Event) {
  if (api.model.spaceSuit.on) {
    api.model.spaceSuit.diseases.push(data);
  } else {
    biologicalSystemsInfluence(api, data.influence, event);
  }
}

interface OnTheShipModifier extends Modifier {
  shipId: number;
}

function enterShip(api: MagellanModelApiInterface, data: number, event: Event) {
  const counter = api.aquired('counters', `ship_${data}`);
  if (counter && counter.shield) {
    const shieldValue = Number(counter.shield);
    spaceSuitTakeOff(api, shieldValue, event);
  } else {
    api.error("enterShip: can't find ship shields data", { shipId: data });
  }

  leaveShip(api, null, event);
  const eff: Effect = { enabled: true, id: 'on-the-ship', class: 'physiology', type: 'normal', handler: 'onTheShip' };
  const m: OnTheShipModifier = { mID: 'OnTheShip', enabled: true, effects: [eff], shipId: data };
  api.addModifier(m);
}

function leaveShip(api: MagellanModelApiInterface, _data: null, _event: Event) {
  api.removeModifier('OnTheShip');
}

function onTheShip(api: MagellanModelApiInterface, modifier: OnTheShipModifier) {
  const c: Condition = {
    mID: uuid(),
    id: 'on-the-ship',
    class: 'physiology',
    text: `Вы находитесь на корабле номер ${modifier.shipId}`,
  };
  api.addCondition(c);
  api.model.location = `ship_${modifier.shipId}`;
}

export interface SpaceSuitRefillData {
  uniqueId: string;
  time: number;
}

function spaceSuitRefill(api: MagellanModelApiInterface, data: SpaceSuitRefillData, event: Event) {
  const counter = api.aquired('counters', data.uniqueId);
  if (!counter) {
    api.error("spaceSuitRefill: can't aquire space suit refill code", { uniqueId: data.uniqueId });
    return;
  }

  if (counter.usedBy) {
    api.warn('spaceSuitRefill: already used space suit refill code. Cheaters gonna cheat?', {
      terminalId: api.model._id,
      uniqueId: data.uniqueId,
    });
    return;
  }

  counter.usedBy = api.model._id;

  // If person forgot about disinfecting it first... Well, too bad!
  spaceSuitTakeOff(api, 0, event);
  const oxygenTimeMs = data.time * 60 * 1000;
  api.model.spaceSuit.oxygenCapacity = oxygenTimeMs;
  api.model.spaceSuit.timestampWhenPutOn = event.timestamp;

  api.setTimer('spacesuit', oxygenTimeMs, 'space-suit-take-off', 0);
  api.model.spaceSuit.on = true;
}

function spaceSuitTakeOff(api: MagellanModelApiInterface, disinfectionLevel: number, event: Event) {
  if (!api.model.spaceSuit.on) return;

  api.model.spaceSuit.on = false;
  api.removeTimer('spacesuit');

  for (const disease of api.model.spaceSuit.diseases) {
    const diff = disease.power - disinfectionLevel;
    if (diff > Math.random() * 100) {
      biologicalSystemsInfluence(api, disease.influence, event);
    }
  }
}

function fullRollback(api: MagellanModelApiInterface, _: any, event: Event) {
  for (const i of allSystemsIndices()) api.model.systems[i].value = 0;
  api.model.timers = {};
  helpers.addChangeRecord(api, 'Извините за баги :(', event.timestamp);
}

module.exports = () => {
  return {
    modifySystemsInstant,
    modifyNucleotideInstant,
    diseaseTick,
    mutation,
    biologicalSystemsInfluence,
    onTheShip,
    enterShip,
    leaveShip,
    spaceSuitTakeOff,
    spaceSuitRefill,
    xenoDisease,
    fullRollback,
  };
};
