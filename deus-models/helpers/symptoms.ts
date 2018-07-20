import { BiologicalSystems, OrganismModel, System, systemsIndices } from './basic-types';

export enum Symptoms {
  SevereHeadache,
  Faint,
  Tic,
  Headache,
  Dizziness,
  Dyspnea,
  Melancholy,
  Jitters,
  FingertipsTingling,
  Convulsions,
  LimbNumbness,
  Tremor,
  InvoluntaryMovements,
  Hallucinations,
  LowBodyTemperature,
  HardToMove,
  Chills,
  HeartPain,
  Sleepiness,
  DimVision,
  Thirst,
  Nosebleeding,
  Tachycardia,
  HardToBreath,
  HighFever,
  ContinuousPainLowAbdomen,
  Pruritus,
  PainLowBack,
  Bloating,
  PainPushRightAbdomen,
  Weakness,
  Nausea,
  Fever,
  PainWhenMoving,
  SharpAbdomenPain,
  Indigestion,
  PainRightAbdomen,
  PainLeftAbdomen,
  AbdomenDiscomfort,
  AppetiteLoss,
  AbdomenTingling,
  Vomiting,
  ContinuousPainUpperAbdomen,
  Hemoptysis,
  Wheeze,
  Aphonia,
  Cough,
  ThroatPain,
  SoreThroat,
  Hiccough,
  RapidBreathing,
  RunnyNose,
  LightDeafness,
  Blindness,
  Deafness,
  CantMove,
  ColdLimbs,
  BoneAche,
  JointsCreak,
  JointsPain,
  UnsteadyGait,
  SoftTissuesSwelling,
  Blisters,
  InflammationsAbscesses,
  Hives,
  SkinPeeling,
  SkinRedness,
  SkinDarkening,
  NailsDarkening,
  TactileSensitivityLoss,
  HairLoss,

  Death,
}

export const symptomToRussian = new Map<Symptoms, string>([
  [Symptoms.SevereHeadache, 'Сильная головная боль'],
  [Symptoms.Faint, 'Обмороки'],
  [Symptoms.Tic, 'Нервный тик'],
  [Symptoms.Headache, 'Головная боль'],
  [Symptoms.Dizziness, 'Головокружение'],
  [Symptoms.Dyspnea, 'Одышка'],
  [Symptoms.Melancholy, 'Меланхоличность'],
  [Symptoms.Jitters, 'Нервное возбуждение'],
  [Symptoms.FingertipsTingling, 'Покалывание в кончиках пальцев'],
  [Symptoms.Convulsions, 'Судороги'],
  [Symptoms.LimbNumbness, 'Онемение конечностей'],
  [Symptoms.Tremor, 'Тремор'],
  [Symptoms.InvoluntaryMovements, 'Непроизвольные движения'],
  [Symptoms.Hallucinations, 'Галлюцинации'],
  [Symptoms.LowBodyTemperature, 'Низкая температура тела'],
  [Symptoms.HardToMove, 'Затруднены движения'],
  [Symptoms.Chills, 'Озноб'],
  [Symptoms.HeartPain, 'Прихватывает сердце'],
  [Symptoms.Sleepiness, 'Сонливость'],
  [Symptoms.DimVision, 'Темнеет в глазах'],
  [Symptoms.Thirst, 'Жажда'],
  [Symptoms.Nosebleeding, 'Носовое кровотечение'],
  [Symptoms.Tachycardia, 'Учащенное сердцебиение'],
  [Symptoms.HardToBreath, 'Затрудненное дыхание'],
  [Symptoms.HighFever, 'Сильный жар'],
  [Symptoms.ContinuousPainLowAbdomen, 'Непрекращающаяся боль в нижней части живота'],
  [Symptoms.Pruritus, 'Зуд'],
  [Symptoms.PainLowBack, 'Боль в пояснице'],
  [Symptoms.Bloating, 'Вздутие живота'],
  [Symptoms.PainPushRightAbdomen, 'Боль при нажатии на правый бок'],
  [Symptoms.Weakness, 'Слабость'],
  [Symptoms.Nausea, 'Тошнота'],
  [Symptoms.Fever, 'Жар'],
  [Symptoms.PainWhenMoving, 'Боль при движении'],
  [Symptoms.SharpAbdomenPain, 'Резь в животе'],
  [Symptoms.Indigestion, 'Расстройство пищеварения'],
  [Symptoms.PainRightAbdomen, 'Боль в правом подреберье'],
  [Symptoms.PainLeftAbdomen, 'Боль в левом подреберье'],
  [Symptoms.AbdomenDiscomfort, 'Дискомфорт в животе'],
  [Symptoms.AppetiteLoss, 'Потеря аппетита'],
  [Symptoms.AbdomenTingling, 'Покалывание в животе'],
  [Symptoms.Vomiting, 'Рвота'],
  [Symptoms.ContinuousPainUpperAbdomen, 'Непрекращающаяся боль в верхней части живота'],
  [Symptoms.Hemoptysis, 'Кровохарканье'],
  [Symptoms.Wheeze, 'Дыхание с хрипами'],
  [Symptoms.Aphonia, 'Потеря голоса'],
  [Symptoms.Cough, 'Кашель'],
  [Symptoms.ThroatPain, 'Боль в горле'],
  [Symptoms.SoreThroat, 'Горло саднит'],
  [Symptoms.Hiccough, 'Икота'],
  [Symptoms.RapidBreathing, 'Учащенное дыхание'],
  [Symptoms.RunnyNose, 'Насморк'],
  [Symptoms.LightDeafness, 'Легкая глухота'],
  [Symptoms.Blindness, 'Потеря зрения'],
  [Symptoms.Deafness, 'Потеря слуха'],
  [Symptoms.CantMove, 'Невозможно двигаться'],
  [Symptoms.ColdLimbs, 'Холодные конечности'],
  [Symptoms.BoneAche, 'Ломота в костях'],
  [Symptoms.JointsCreak, '"Скрип" в суставах'],
  [Symptoms.JointsPain, 'Боль в суставах'],
  [Symptoms.UnsteadyGait, 'Неустойчивая походка'],
  [Symptoms.SoftTissuesSwelling, 'Отек мягких тканей'],
  [Symptoms.Blisters, 'Волдыри'],
  [Symptoms.InflammationsAbscesses, 'Воспаления и нарывы'],
  [Symptoms.Hives, 'Крапивница'],
  [Symptoms.SkinPeeling, 'Шелушение кожных покровов'],
  [Symptoms.SkinRedness, 'Покраснение кожных покровов'],
  [Symptoms.SkinDarkening, 'Потемнение кожных покровов'],
  [Symptoms.NailsDarkening, 'Потемнение ногтевых пластин'],
  [Symptoms.TactileSensitivityLoss, 'Потеря тактильной чувствительности'],
  [Symptoms.HairLoss, 'Выпадение волос'],
]);

// tslint:disable:max-line-length
export const systemToSymptoms = new Map<BiologicalSystems, Symptoms[]>([
  [BiologicalSystems.Nervous,
  [Symptoms.SevereHeadache, Symptoms.Faint, Symptoms.Tic, Symptoms.Headache, Symptoms.Dizziness, Symptoms.Dyspnea, Symptoms.Melancholy,
  Symptoms.Jitters, Symptoms.FingertipsTingling, Symptoms.Convulsions, Symptoms.LimbNumbness, Symptoms.Tremor, Symptoms.InvoluntaryMovements, Symptoms.Hallucinations]],
  [BiologicalSystems.Cardiovascular,
  [Symptoms.LowBodyTemperature, Symptoms.HardToMove, Symptoms.Chills, Symptoms.Convulsions, Symptoms.HeartPain, Symptoms.Sleepiness, Symptoms.DimVision,
  Symptoms.Thirst, Symptoms.Jitters, Symptoms.Faint, Symptoms.Nosebleeding, Symptoms.Tachycardia, Symptoms.HardToBreath, Symptoms.HighFever]],
  [BiologicalSystems.Reproductive,
  [Symptoms.ContinuousPainLowAbdomen, Symptoms.Chills, Symptoms.Pruritus, Symptoms.PainLowBack, Symptoms.Bloating, Symptoms.DimVision, Symptoms.PainPushRightAbdomen,
  Symptoms.Weakness, Symptoms.Nausea, Symptoms.Thirst, Symptoms.Fever, Symptoms.Faint, Symptoms.PainLowBack, Symptoms.PainWhenMoving]],
  [BiologicalSystems.Digestive,
  [Symptoms.SharpAbdomenPain, Symptoms.Indigestion, Symptoms.Bloating, Symptoms.PainRightAbdomen, Symptoms.PainLeftAbdomen, Symptoms.Thirst, Symptoms.AbdomenDiscomfort,
  Symptoms.AppetiteLoss, Symptoms.AbdomenTingling, Symptoms.PainRightAbdomen, Symptoms.Nausea, Symptoms.PainLowBack, Symptoms.Vomiting, Symptoms.ContinuousPainUpperAbdomen]],
  [BiologicalSystems.Respiratory,
  [Symptoms.Hemoptysis, Symptoms.Wheeze, Symptoms.Aphonia, Symptoms.HardToBreath, Symptoms.Cough, Symptoms.ThroatPain, Symptoms.SoreThroat,
  Symptoms.Hiccough, Symptoms.RapidBreathing, Symptoms.RunnyNose, Symptoms.LightDeafness, Symptoms.Blindness, Symptoms.Deafness, Symptoms.Headache]],
  [BiologicalSystems.Musculoskeletal,
  [Symptoms.CantMove, Symptoms.Convulsions, Symptoms.Tic, Symptoms.Tremor, Symptoms.Chills, Symptoms.ColdLimbs, Symptoms.FingertipsTingling,
  Symptoms.BoneAche, Symptoms.JointsCreak, Symptoms.LimbNumbness, Symptoms.JointsPain, Symptoms.InvoluntaryMovements, Symptoms.PainWhenMoving, Symptoms.UnsteadyGait]],
  [BiologicalSystems.Integumentary,
  [Symptoms.SoftTissuesSwelling, Symptoms.Blisters, Symptoms.InflammationsAbscesses, Symptoms.Hives, Symptoms.Pruritus, Symptoms.SkinPeeling, Symptoms.SkinRedness,
  Symptoms.FingertipsTingling, Symptoms.SkinDarkening, Symptoms.NailsDarkening, Symptoms.FingertipsTingling, Symptoms.TactileSensitivityLoss, Symptoms.HairLoss, Symptoms.Blindness]],
]);
// tslint:enable:max-line-length

export function getSymptomValue(system: System) {
  const l = Math.min(0, system.nucleotide);
  const r = Math.max(0, system.nucleotide);
  if (system.value < l)
    return system.value - l;

  if (system.value > r)
    return system.value - r;

  return 0;
}

export function getSymptomsInternal(systems: System[]): Set<Symptoms> {
  const result = new Set<Symptoms>();
  for (const indice of systemsIndices()) {
    const v = getSymptomValue(systems[indice]);
    if (Math.abs(v) > 7) return new Set<Symptoms>([Symptoms.Death]);
    if (v > 0)
      result.add((systemToSymptoms.get(indice) as Symptoms[])[6 + v]);
    if (v < 0)
      result.add((systemToSymptoms.get(indice) as Symptoms[])[7 + v]);
  }

  return result;
}

export function getSymptoms(model: OrganismModel): Set<Symptoms> {
  return getSymptomsInternal(model.systems);
}
