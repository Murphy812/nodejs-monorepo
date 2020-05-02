import { isEqual } from 'lodash';

import { Sr2020Character, AddedPassiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { EthicScale, kEthicLevels, kAllCrysises, EthicTrigger, kEthicAbilities } from './ethics_library';
import { EventModelApi, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { kAllPassiveAbilities } from './passive_abilities_library';

const MAX_ETHIC_VALUE = 4;
const ETHIC_COOLDOWN_MS = 30 * 1000;

export function initEthic(model: Sr2020Character) {
  updatePersonalEthic(
    model,
    new Map([
      ['violence', 0],
      ['control', 0],
      ['individualism', 0],
      ['mind', 0],
    ]),
  );
}

// Update ethic profile based on the new ethic values.
// Will remove all non-crysis triggers and recalculate state.
// Returns true if ethic ability was added and false otherwise.
function updatePersonalEthic(model: Sr2020Character, ethicValues: Map<EthicScale, number>): boolean {
  model.ethic.state = [];
  model.ethic.trigger = model.ethic.trigger.filter((t) => t.kind == 'crysis');
  for (const [scale, value] of ethicValues) {
    const level = kEthicLevels.find((l) => l.scale == scale && l.value == value)!;
    model.ethic.state.push({
      scale,
      value,
      description: level.description,
    });
    model.ethic.trigger.push(
      ...level.triggers.map((t) => {
        return {
          id: t.id,
          kind: t.kind,
          description: t.description,
        };
      }),
    );
  }

  const allEthicAbilitiesIds = kEthicAbilities.map((it) => it.abilityId);
  const characterEthicAbilities = [
    ...model.activeAbilities.filter((it) => allEthicAbilitiesIds.includes(it.id)).map((it) => it.id),
    ...model.passiveAbilities.filter((it) => allEthicAbilitiesIds.includes(it.id)).map((it) => it.id),
  ];

  const newEthicAbilities = model.ethic.trigger.find((it) => it.kind == 'crysis')
    ? []
    : kEthicAbilities.filter((it) => ethicValues.get(it.scale) == it.value).map((it) => it.abilityId);

  const abilitiesChanged = !isEqual(characterEthicAbilities.sort(), newEthicAbilities.sort());
  if (abilitiesChanged) {
    model.passiveAbilities = model.passiveAbilities.filter((it) => !characterEthicAbilities.includes(it.id));
    model.activeAbilities = model.activeAbilities.filter((it) => !characterEthicAbilities.includes(it.id));

    for (const abilityId of newEthicAbilities) {
      const ability = kAllPassiveAbilities.get(abilityId);
      if (ability) {
        const addedAbility: AddedPassiveAbility = { id: ability.id, name: ability.name, description: ability.description };
        model.passiveAbilities.push(addedAbility);
      }
    }
  }
  return abilitiesChanged;
}

function findTrigger(id: string): EthicTrigger {
  const crysis = kAllCrysises.find((cr) => cr.id == id);
  if (crysis) return crysis;

  for (const level of kEthicLevels) {
    const trigger = level.triggers.find((t) => t.id == id);
    if (trigger) return trigger;
  }

  throw new UserVisibleError('Триггер не найден');
}

export function ethicSet(
  api: EventModelApi<Sr2020Character>,
  data: { violence: number; control: number; individualism: number; mind: number },
  _: Event,
) {
  updatePersonalEthic(
    api.model,
    new Map([
      ['violence', data.violence],
      ['control', data.control],
      ['individualism', data.individualism],
      ['mind', data.mind],
    ]),
  );
}

export function ethicTrigger(api: EventModelApi<Sr2020Character>, data: { id: string }, event: Event) {
  const trigger = findTrigger(data.id);
  const values: Map<EthicScale, number> = new Map();
  for (const l of api.model.ethic.state) values.set(l.scale, l.value);

  let crysisResolved = false;

  if (trigger.kind == 'crysis') {
    api.model.ethic.trigger = api.model.ethic.trigger.filter((t) => t.id != data.id);
    crysisResolved = true;
  }

  let valuesShifted = false;

  for (const shift of trigger.shifts) {
    const v = values.get(shift.scale)!;
    if (v >= shift.conditionMin && v <= shift.conditionMax) {
      if (Math.abs(v + shift.change) == MAX_ETHIC_VALUE) {
        for (const [scale, value] of values) {
          values.set(scale, Math.max(Math.min(value, MAX_ETHIC_VALUE - 1), -MAX_ETHIC_VALUE + 1));
        }
      }
      values.set(shift.scale, v + shift.change);
      valuesShifted = true;
    }
  }

  let crysisAdded = false;

  for (const crysisIndex of trigger.crysises) {
    const crysis = kAllCrysises[crysisIndex - 1];
    if (!api.model.ethic.trigger.some((t) => t.id == crysis.id)) {
      api.model.ethic.trigger.push({
        id: crysis.id,
        kind: crysis.kind,
        description: crysis.description,
      });
      crysisAdded = true;
    }
  }

  const gotNewAbility = updatePersonalEthic(api.model, values);

  if (valuesShifted) {
    api.model.ethic.lockedUntil = event.timestamp + ETHIC_COOLDOWN_MS;
  }

  if (valuesShifted) {
    // We assume that situation valuesShifted && crysisAdded is not possible
    let message = crysisResolved
      ? 'Кризис разрешен и это вызвало изменение этических параметров'
      : 'Ваше действие вызвало изменение этических параметров';
    if (gotNewAbility) {
      message = message + '. Вы получили этическую способность!';
    }
    api.sendNotification('Этика', message);
  } else {
    // We assume that situation crysisResolved && crysisAdded is not possible
    if (crysisResolved) {
      api.sendNotification('Этика', 'Кризис разрешен');
    }

    if (crysisAdded) {
      api.sendNotification('Этика', 'Ваше действие привело к кризису');
    }
  }
}
