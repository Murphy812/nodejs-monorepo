import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Death & Rebirth', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Healthy -> Wounded -> Clinically dead -> Healthy', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });
    await fixture.advanceTime(1800);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'clinically_dead' } });
    await fixture.sendCharacterEvent({ eventType: 'revive' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });

  it('Revive cancels death timer', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });
    await fixture.advanceTime(900);
    await fixture.sendCharacterEvent({ eventType: 'revive' });
    await fixture.advanceTime(900);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });

  it('Healthy -> Wounded -> Revived by implant -> Wound -> No revive because cooldown', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'medkit-alpha' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });

    await fixture.advanceTime(600);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    await fixture.advanceTime(1800);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'clinically_dead' } });
  });

  it('Healthy -> Wounded -> Revived by implant -> (wait) -> Wound -> Revived by implant', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'medkit-alpha' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });

    await fixture.advanceTime(600);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });

    await fixture.advanceTime(4 * 3600);

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    await fixture.advanceTime(600);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
    await fixture.advanceTime(1800);
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });
});
