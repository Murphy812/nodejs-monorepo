import { merge } from 'lodash';
import { getEvents, getNoOpEvent } from '../helpers/events';
import { getExampleBiologicalOrganismModel, getExampleLabTerminalModel } from '../helpers/example-models';
import { process } from '../helpers/util';

interface Global {
  TEST_EXTERNAL_OBJECTS: any;
}

// eslint-disable-next-line no-var
declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
  counters: {
    '111-111': { _id: '111-111', foo: 'bar' },
    '111-112': { _id: '111-112', bar: 'foo' },
  },
});

describe('Medic Magellan events: ', () => {
  it('No-op refresh model', async () => {
    const model = getExampleLabTerminalModel();
    const events = [getNoOpEvent(model._id, model.timestamp + 610 * 1000)];
    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.timestamp).toBe(610 * 1000);
    expect(workingModel.timestamp).toBe(610 * 1000);

    model.timestamp = 610 * 1000;

    expect(baseModel).toEqual(model);
  });

  it('Add tests via QR', async () => {
    let model = getExampleLabTerminalModel();

    const data = {
      type: 20,
      kind: 0,
      validUntil: 0,
      payload: '111-111,12',
    };

    const events = getEvents(model._id, [{ eventType: 'scanQR', data }], 100);

    model.numTests = 10;
    model = (await process(model, events)).baseModel;
    expect(model.numTests).toBe(10 + 12);
  });

  it("Can't add tests with same QR twice", async () => {
    let model = getExampleLabTerminalModel();

    const data = {
      type: 20,
      kind: 0,
      validUntil: 0,
      payload: '111-112,12',
    };

    let events = getEvents(model._id, [{ eventType: 'scanQR', data }], 100);

    model.numTests = 10;
    model = (await process(model, events)).baseModel;
    expect(model.numTests).toBe(10 + 12);

    expect(global.TEST_EXTERNAL_OBJECTS.counters['111-112']).toHaveProperty('usedBy', model._id);

    events = getEvents(model._id, [{ eventType: 'scanQR', data }], 200);
    model = (await process(model, events)).baseModel;
    expect(model.numTests).toBe(10 + 12);
  });

  it('Run test', async () => {
    let model = getExampleLabTerminalModel();
    const data = {
      test: 'nucleotide',
      model: getExampleBiologicalOrganismModel(),
    };
    const events = getEvents(model._id, [{ eventType: 'medic-run-lab-test', data }], 100);

    model.numTests = 10;
    const patientHistoryLengthBefore = model.patientHistory.length;
    model = (await process(model, events)).baseModel;
    expect(model.numTests).toBe(10 - 1);
    expect(model.patientHistory).toHaveLength(patientHistoryLengthBefore + 1);
  });

  it('Run test with numTests = 0', async () => {
    let model = getExampleLabTerminalModel();
    const data = {
      test: 'nucleotide',
      model: getExampleBiologicalOrganismModel(),
    };
    const events = getEvents(model._id, [{ eventType: 'medic-run-lab-test', data }], 100);

    model.numTests = 0;
    const patientHistoryLengthBefore = model.patientHistory.length;
    model = (await process(model, events)).baseModel;
    expect(model.numTests).toBe(0);
    expect(model.patientHistory).toHaveLength(patientHistoryLengthBefore + 1);
    expect(model.patientHistory[model.patientHistory.length - 1]).toMatchObject({ type: 'Ошибка' });
  });
});
