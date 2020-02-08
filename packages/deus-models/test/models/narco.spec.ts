//Тесты наркотиков

import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import * as fs from 'async-file';

function expectNarcoIgnoredForProfileType(profileType: string) {
  it(`Narco ignored for ${profileType}`, async function() {
    const model = getExampleModel();
    model.profileType = profileType;
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'altnarco' } }], model.timestamp);
    const { workingModel } = await process(model, events);

    const modifiers = workingModel.modifiers.filter((e: any) => e.id == 'narcoEffects');
    expect(modifiers.length).is.equal(0);
  });
}

describe('Narco effects: ', () => {
  it('Change mind cube', async function() {
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'altnarco' } }], model.timestamp);
    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.mind.F[3]).is.equal(62);
    expect(workingModel.mind.E[1]).is.equal(100);
    expect(baseModel.mind.E[1]).is.equal(57);

    const modifiers = workingModel.modifiers.filter((e: any) => e.id == 'narcoEffects');
    expect(modifiers.length).is.equal(1);

    const conditions = workingModel.conditions.filter((e: any) => e.id == 'mcube-condition-F3-1');

    expect(conditions.length).is.equal(1);
  });

  expectNarcoIgnoredForProfileType('robot');
  expectNarcoIgnoredForProfileType('program');
  expectNarcoIgnoredForProfileType('exhuman-program');
  expectNarcoIgnoredForProfileType('exhuman-robot');

  it('Change mind cube back', async function() {
    const model = getExampleModel();

    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'altnarco' } }], model.timestamp);
    events.push(getRefreshEvent(model.modelId, model.timestamp + 18000 * 1101));
    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.mind.F[3]).is.equal(62); //permanent change is here
    expect(workingModel.mind.E[1]).is.equal(57); //temporary change rolled back

    const modifiers = baseModel.modifiers.filter((e: any) => e.id == 'narcoEffects');
    expect(modifiers.length).is.equal(0);
  });

  it('Mind cube pushback', async function() {
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'altnarco_with_pushback' } }], model.timestamp);
    events.push(getRefreshEvent(model.modelId, model.timestamp + 18000 * 1001));
    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.mind.F[2]).is.equal(47); //permanent change is here
    expect(workingModel.mind.E[1]).is.equal(0); //temporary change is pushed back

    const modifiers = baseModel.modifiers.filter((e: any) => e.id == 'narcoEffects');
    expect(modifiers.length).is.equal(1);
  });

  it('Narco with condition', async function() {
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'cometa' } }], model.timestamp);
    const { workingModel } = await process(model, events);

    expect(workingModel.conditions.filter((e: any) => e.id == 'euphoria-condition').length).is.equal(1);
  });

  it('Narco with condition ends', async function() {
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'cometa' } }], model.timestamp);
    events.push(getRefreshEvent(model.modelId, model.timestamp + 18000 * 1001));
    const { workingModel } = await process(model, events);

    expect(workingModel.conditions.filter((e: any) => e.id == 'euphoria-condition').length).is.equal(0);
  });

  it('Narco with history record', async function() {
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'cometa' } }], model.timestamp);
    const { workingModel } = await process(model, events);

    expect(
      workingModel.changes.filter((e: any) => e.text == 'Таблетка начала действовать. Надень браслет и следуй указаниям дилера.').length,
    ).is.equal(1);
  });

  it('All narcos parsed', async function() {
    const all_narcos = JSON.parse(await fs.readTextFile('catalogs/narco.json')).pills;
    const conditions = JSON.parse(await fs.readTextFile('catalogs/conditions.json')).conditions;

    all_narcos.forEach((narco: any) => {
      if (narco.conditions) {
        narco.conditions.forEach((condition: string) => {
          const conditionObj = conditions.filter((c: any) => c.id == condition);
          expect(conditionObj.length).is.equal(1);
        });

        expect(narco.id).is.exist;
        expect(narco.duration).is.exist;
      }
    });
  });

  it('Narco ascend', async function() {
    const model = getExampleModel();

    model.genome[2 - 1] = 0;
    model.genome[7 - 1] = 3;
    model.genome[10 - 1] = 2;
    model.genome[12 - 1] = 1;

    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'ascend-apostle-pill' } }], model.timestamp, true);
    const { baseModel, workingModel } = await process(model, events);

    expect(workingModel.conditions.filter((e: any) => e.id == 'ascend-condition').length).is.equal(1);

    expect(baseModel.genome[7 - 1]).is.equal(4);
    expect(baseModel.genome[10 - 1]).is.equal(4);
    expect(baseModel.genome[12 - 1]).is.equal(4);
  });

  it('Narco ascend failed', async function() {
    const model = getExampleModel();

    model.genome[2 - 1] = 0;
    model.genome[7 - 1] = 3;
    model.genome[10 - 1] = 2;
    model.genome[12 - 1] = 2;

    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'ascend-apostle-pill' } }], model.timestamp, true);

    const { workingModel } = await process(model, events);

    expect(workingModel.conditions.filter((e: any) => e.id == 'ascend-condition').length).is.equal(0);
  });

  it('Narco ascend no immediate lllness', async function() {
    const model = getExampleModel();

    model.genome[2 - 1] = 0;
    model.genome[7 - 1] = 3;
    model.genome[10 - 1] = 2;
    model.genome[12 - 1] = 2;

    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'ascend-apostle-pill' } }], model.timestamp, true);

    let { baseModel, workingModel } = await process(model, events);

    const refresh = [getRefreshEvent(model.modelId, 1)];
    const result = await process(baseModel, refresh);

    baseModel = result.baseModel;
    workingModel = result.workingModel;

    const illness = workingModel.modifiers.filter((m: any) => m.id == 'ankylosingspondylitis');

    expect(illness.length).is.equal(0);
  });

  it('Narco ascend failed and leads to death', async function() {
    const model = getExampleModel();

    model.genome[2 - 1] = 0;
    model.genome[7 - 1] = 3;
    model.genome[10 - 1] = 2;
    model.genome[12 - 1] = 2;

    const events = getEvents(model.modelId, [{ eventType: 'take-narco', data: { id: 'ascend-apostle-pill' } }], model.timestamp, true);

    let { baseModel } = await process(model, events);

    const refresh = [getRefreshEvent(model.modelId, 60 * 60 * 24 * 1000)];
    const result = await process(baseModel, refresh);

    baseModel = result.baseModel;

    expect(baseModel.isAlive).is.false;
  });
});
