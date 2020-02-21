import { model, property } from '@loopback/repository';
import { EmptyModel, rproperty, JsonColumn } from './alice-model-engine';
import { BaseModelProcessRequest, BaseModelProcessResponse } from './process-requests-respose';
import { Entity, Column } from 'typeorm';

// Spell contained in the model object (as opposed to Spell which is configuration/dictionary kind).
@model()
export class AddedSpell {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() humanReadableName: string;

  // Full description. Can be multiline.
  @rproperty() description: string;
  @rproperty() eventType: string;
}

// Active ability contained in the model object (as opposed to ActiveAbility which is configuration/dictionary kind).
@model()
export class AddedActiveAbility {
  // Unique string identifier. Should be unique not only among all AddedActiveAbility, but also among
  // other features: passive abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() humanReadableName: string;

  // Full description. Can be multiline.
  @rproperty() description: string;

  // True if ability needs a target - other character or object
  @rproperty() hasTarget: boolean = false;

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @property() validUntil?: number;

  @rproperty() eventType: string;
}

// Passive ability contained in the model object (as opposed to PassiveAbility which is configuration/dictionary kind).
@model()
export class AddedPassiveAbility {
  // Unique string identifier. Should be unique not only among all AddedPassiveAbility, but also among
  // other features: active abilities, spells, etc.
  @rproperty() id: string;

  // Short-ish human-readable name to be shown in the UI.
  @rproperty() name: string;

  // Full description. Can be multiline.
  @rproperty() description: string;

  // Unix timestamp in milliseconds. Set only if ability is temporary
  // (e.g. was added by effect of some other ability or spell)
  @property() validUntil?: number;

  // List of modifiers added by this passive ability. Used to remove them when feature is being removed.
  // Can be omitted if this passive abiliy doesn't have any modifiers (i.e. it's only effect is to
  // show some text to the user).
  @property.array(String) modifierIds?: string[];
}

@model()
export class HistoryRecord {
  @rproperty() id: string;
  @rproperty() timestamp: number;
  @rproperty() title: string;
  @rproperty() shortText: string;
  @rproperty() longText: string;
}

@model()
@Entity({
  name: 'sr2020-character',
})
export class Sr2020Character extends EmptyModel {
  @rproperty()
  @Column()
  maxHp: number;

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'healthy' })
  healthState: 'healthy' | 'wounded' | 'clinically_dead' | 'biologically_dead';

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'мужчина' })
  gender: 'мужчина' | 'женщина';

  @property({ required: true, type: 'string' })
  @Column({ type: 'text', default: 'meta-norm' })
  metarace: 'meta-norm' | 'meta-elf' | 'meta-dwarf' | 'meta-ork' | 'meta-troll' | 'meta-hmhvv' | 'meta-digital' | 'meta-spirit';

  @rproperty()
  @Column()
  magicPowerBonus: number;

  @rproperty()
  @Column()
  magicAura: string;

  @rproperty()
  @Column({ default: 0 })
  body: number;

  @rproperty()
  @Column({ default: 0 })
  intelligence: number;

  @rproperty()
  @Column({ default: 0 })
  charisma: number;

  @rproperty()
  @Column({ default: 0 })
  magic: number;

  @rproperty()
  @Column({ default: 0 })
  resonance: number;

  @rproperty()
  @Column({ default: 0 })
  maxTimeAtHost: number;

  @rproperty()
  @Column({ default: 0 })
  hostEntrySpeed: number;

  @rproperty()
  @Column({ default: 0 })
  conversionAttack: number;

  @rproperty()
  @Column({ default: 0 })
  conversionFirewall: number;

  @rproperty()
  @Column({ default: 0 })
  conversionSleaze: number;

  @rproperty()
  @Column({ default: 0 })
  conversionDataprocessing: number;

  @rproperty()
  @Column({ default: 0 })
  adminHostNumber: number;

  @rproperty()
  @Column({ default: 0 })
  spriteLevel: number;

  @rproperty()
  @Column({ default: 30 })
  maxTimeInVr: number;

  @rproperty()
  @Column({ default: 0 })
  magicFeedbackReduction: number;

  @rproperty()
  @Column({ default: 1.0 })
  magicRecoverySpeed: number;

  @rproperty()
  @Column({ default: 1.0 })
  spiritResistanceMultiplier: number;

  @rproperty()
  @Column({ default: 1.0 })
  auraReadingMultiplier: number;

  @rproperty()
  @Column({ default: 1.0 })
  auraMarkMultiplier: number;

  @rproperty()
  @Column({ default: 0 })
  auraMask: number;

  @rproperty()
  @Column({ default: 0 })
  ethicGroupMaxSize: number;

  @rproperty()
  @Column({ default: 9000 })
  chemoBodyDetectableThreshold: number;

  @rproperty()
  @Column({ default: 9000 })
  chemoPillDetectableThreshold: number;

  @rproperty()
  @Column({ default: 50 })
  chemoBaseEffectThreshold: number;

  @rproperty()
  @Column({ default: 70 })
  chemoSuperEffectThreshold: number;

  @rproperty()
  @Column({ default: 120 })
  chemoCrysisThreshold: number;

  @rproperty()
  @Column({ default: 0 })
  stockGainPercentage: number;

  @rproperty()
  @Column({ default: 0 })
  discountWeaponsArmor: number;

  @rproperty()
  @Column({ default: 0 })
  discountDrones: number;

  @rproperty()
  @Column({ default: 0 })
  discountChemo: number;

  @rproperty()
  @Column({ default: 0 })
  discountImplants: number;

  @rproperty()
  @Column({ default: 0 })
  discountMagicStuff: number;

  @property.array(AddedSpell, { required: true })
  @JsonColumn()
  spells: AddedSpell[];

  @property.array(AddedActiveAbility, { required: true })
  @JsonColumn()
  activeAbilities: AddedActiveAbility[];

  @property.array(AddedPassiveAbility, { required: true })
  @JsonColumn()
  passiveAbilities: AddedPassiveAbility[];

  @property.array(HistoryRecord, { required: true })
  @JsonColumn()
  history: HistoryRecord[];
}

@model()
export class Sr2020CharacterProcessRequest extends BaseModelProcessRequest {
  @rproperty()
  baseModel: Sr2020Character;
}

@model()
export class Sr2020CharacterProcessResponse extends BaseModelProcessResponse {
  @rproperty()
  baseModel: Sr2020Character;

  @rproperty()
  workModel: Sr2020Character;
}
