import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Spells', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Learn and forget dummy spell', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
      expect(workModel).containDeep({ spells: [{ eventType: 'dummySpell' }] });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetSpell', data: { spellName: 'dummySpell' } });
      expect(workModel.spells).to.be.empty();
    }
  });

  it('Forget unlearned spell', async () => {
    await fixture.saveCharacter();
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetSpell', data: { spellName: 'dummySpell' } });
    expect(workModel.spells).to.be.empty();
  });

  it('Forget all spells', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetAllSpells', data: {} });
    expect(workModel.spells).to.be.empty();
  });

  it('Cast dummy spell', async () => {
    await fixture.saveCharacter({ spellsCasted: 12 });
    await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dummySpell', data: {} });
    expect(workModel).containDeep({ spellsCasted: 13 });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
  });

  it("Can't enchant already enchanted", async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode({ type: 'something' });

    await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'dummySpell', data: { qrCode: 0 } })
      .expect(400);
    expect(fixture.getCharacterNotifications()).to.be.empty();

    expect(await fixture.getQrCode()).containDeep({ workModel: { type: 'something' } });
  });

  it('Enchant artifact and activate it later', async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dummySpell', data: { qrCode: 0 } });
      expect(workModel).containDeep({ spellsCasted: 0 });
      expect(await fixture.getQrCode()).containDeep({ workModel: { usesLeft: 3 } });
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0 } });
      expect(workModel).containDeep({ spellsCasted: 1 });
      expect(await fixture.getQrCode()).containDeep({ workModel: { usesLeft: 2 } });
    }
  });

  it('Enchant artifact, give it to another character, activate in another location', async () => {
    await fixture.saveCharacter({ modelId: '1', spellsCasted: 0 });
    await fixture.saveCharacter({ modelId: '2', spellsCasted: 0 });
    await fixture.saveQrCode();
    await fixture.saveLocation({ modelId: '1', manaDensity: 500 });
    await fixture.saveLocation({ modelId: '2', manaDensity: 400 });

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'densityHalveSpell', data: { qrCode: 0, locationId: '1' } }, 1);
      expect(workModel).containDeep({ spellsCasted: 0 });
      expect(await fixture.getLocation(1)).containDeep({ workModel: { manaDensity: 500 } });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0, locationId: '2' } }, 2);
      expect(workModel).containDeep({ spellsCasted: 1 });
      expect(await fixture.getLocation(2)).containDeep({ workModel: { manaDensity: 200 } });
    }
  });

  it('Heal self', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'fullHealSpell', data: {} });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
    expect(fixture.getCharacterNotifications()[0].body).containEql('полностью восстановл');
  });

  it('Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'fullHealSpell', data: { targetCharacterId: 2 } }, 1);
    expect(fixture.getCharacterNotifications(1).length).to.equal(0);
    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('полностью восстановл');
  });

  it('Light Heal self', async () => {
    await fixture.saveCharacter({ magic: 10 });
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'lightHealSpell', data: { power: 5 } });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('хитов: 5');
      expect(workModel.history.length).to.equal(2); // Spell casted + Hp restored
      expect(workModel.magic).to.equal(7); // Spell casted + Hp restored
    }

    {
      fixture.advanceTime(300);
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Light Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveCharacter({ modelId: '2' });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'lightHealSpell', data: { targetCharacterId: 2, power: 3 } }, 1);
    expect(fixture.getCharacterNotifications(1).length).to.equal(1);
    expect(workModel.history.length).to.equal(1); // Spell casted

    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('хитов: 3');
    expect((await fixture.getCharacter(2)).workModel.history.length).to.equal(1); // Hp restored
  });

  it('Ground Heal used', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'groundHealSpell', data: { power: 2 } }, 1);
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(1)[0].body).containEql('Ground Heal');
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.magic).to.equal(9);
    }

    let abilityEventType: string;
    {
      // Power 2 is 20 minutes = 1200 seconds.
      fixture.advanceTime(1199);
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      abilityEventType = workModel.activeAbilities[0].eventType;
      expect(workModel.magic).to.equal(10);
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: abilityEventType, data: { targetCharacterId: 2 } }, 1);
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(1)[0].body).containEql('Ground Heal');
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('Хиты полностью восстановлены');
      expect(workModel.activeAbilities.length).to.equal(0);
    }
  });

  it('Ground Heal expired', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.sendCharacterEvent({ eventType: 'groundHealSpell', data: { power: 2 } });
    // Power 2 is 20 minutes = 1200 seconds.
    fixture.advanceTime(1200);
    const { workModel } = await fixture.getCharacter();
    expect(workModel.activeAbilities.length).to.equal(0);
  });

  it('Live long and prosper self', async () => {
    await fixture.saveCharacter({ magic: 10, maxHp: 3 });
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'liveLongAndProsperSpell', data: { power: 10 } });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('увеличены на 3');
      expect(workModel.history.length).to.equal(2); // Spell casted + Hp restored
      expect(workModel.magic).to.equal(5);
      expect(workModel.maxHp).to.equal(6);
    }

    {
      fixture.advanceTime(180);
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(5);
      expect(workModel.maxHp).to.equal(3);
    }

    {
      fixture.advanceTime(120);
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Live long and prosper other', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveCharacter({ modelId: '2', maxHp: 5 });
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'liveLongAndProsperSpell', data: { targetCharacterId: 2, power: 4 } },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(workModel.history.length).to.equal(1); // Spell casted
    }

    {
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('увеличены на 2');
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.history.length).to.equal(1); // Hp restored
      expect(workModel.maxHp).to.equal(6); // Not 7 as global maximum is 6
    }
  });
});
