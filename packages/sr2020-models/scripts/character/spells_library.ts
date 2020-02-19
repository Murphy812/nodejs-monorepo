import {
  increaseResonanceSpell,
  densityHalveSpell,
  fullHealSpell,
  lightHealSpell,
  groundHealSpell,
  fireballSpell,
  fieldOfDenialSpell,
  liveLongAndProsperSpell,
  trackpointSpell,
  dummySpell,
  spiritsRelatedSpell,
  dummyAreaSpell,
  dummyManaControlSpell,
} from './spells';

export interface Spell {
  id: string;
  humanReadableName: string;
  description: string;
  prerequisites?: string[];
  eventType: string;
}

// Not exported by design, use kAllSpells instead.
const kAllSpellsList: Spell[] = [
  {
    id: 'dummy-spell',
    humanReadableName: 'Заглушка',
    description: 'Спелл-заглушка.',
    eventType: increaseResonanceSpell.name,
  },
  {
    id: 'dummy-halve-density',
    humanReadableName: 'Плотность пополам!',
    description: 'Уменьшает плотность маны в локации вдвое. Может быть наложен на артефакт.',
    eventType: densityHalveSpell.name,
  },
  {
    id: 'dummy-full-heal',
    humanReadableName: 'Исцеление',
    description: 'Восстанавливает все хиты.',
    eventType: fullHealSpell.name,
  },
  {
    id: 'dummy-light-heal',
    humanReadableName: 'Light Heal',
    description: 'Восстанавливает текущие хиты.',
    eventType: lightHealSpell.name,
  },
  {
    id: 'field-of-denial',
    humanReadableName: 'Field of denial',
    description: 'Дает частичную защиту от тяжелого оружия',
    eventType: fieldOfDenialSpell.name,
  },

  {
    id: 'keep-yourself',
    humanReadableName: 'Keep yourself',
    description: 'Увеличение своих хитов. Чем больше Мощь, тем больше хитов и дольше срок',
    // 513
    // время каста 3 минуты, маг может увеличить себе максимальные и текущие хиты на N на время T. N=Мощь. T=10*Мощь минут. Хиты не могут стать больше шести
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'ground-heal',
    humanReadableName: 'Ground Heal',
    description: 'Поднять кого-то из тяжрана. Чем больше Мощь, тем на большее время запасено заклинание',
    // 514
    // время каста 5 минут, у мага появляется на время T/на одно использование (что раньше закончится) способность перевести одну цель из состояние "тяжран" в состояние "текущие хиты равны максимальным". T=Мощь*10 минут
    // TODO(aeremin): Double-check if implementation is correct
    eventType: groundHealSpell.name,
  },

  {
    id: 'live-long-and-prosper',
    humanReadableName: 'Live long and prosper',
    description: 'Увеличить кому-то количество хитов. Чем больше Мощь, тем больше хитов и дольше срок',
    // 515
    // время каста 5 минут, маг увеличивает указанной во время каста цели количество максимальных и текущих хитов на N на время T. N=Мощь. T=10*Мощь минут. Общее количество хитов не может быть больше 6 (согласно правилам по боевке)
    // TODO(aeremin): Double-check if implementation is correct
    eventType: liveLongAndProsperSpell.name,
  },

  {
    id: 'fast-charge',
    humanReadableName: 'Fast charge',
    description: 'Зарядиться на время молниями. Чем больше Мощь, тем больше снарядов и срок',
    // 516
    // время каста 2 минуты, у мага на время T появляется пассивная способность “кинуть N молний”. Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). N=Мощь-2 (но не меньше 1), T=Мощь*10 минут
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'fireball',
    humanReadableName: 'Fireball',
    description: 'Зарядиться на время файерболами. Чем больше Мощь, тем больше снарядов и срок',
    // 517
    // время каста 3 минуты, у мага на время T появляется пассивная способность “кинуть N огненных шаров”. T и N зависят от Мощи. Снаряд выглядит как мягкий шар, его попадание обрабатывается согласно правилам по боевке (тяжелое магическое оружие). N=Мощь-3 (но не меньше 1), T=Мощь*8 минут
    // TODO(aeremin): Double-check implementation
    eventType: fireballSpell.name,
  },

  {
    id: 'tease-lesser-mind',
    humanReadableName: 'Tease lesser mind',
    description:
      'Подготовить способность "магический щит" (прозрачный зонтик, защищает от любого легкого оружия), потребуется ее активация перед использованием. Чем больше Мощь, тем дольше сроки готовности и использования',
    // 518
    // время каста 5 минут, у мага на время T1/на одну активацию (что раньше закончится) появляется активируемая способность, при активации которой он в течение времени T2 может защищаться магическим щитом от атак легким оружием - холодным и дистанционным. T1=Мощь*10 минут. Т2=Мощь*1 минут
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'enlarge-your-pencil',
    humanReadableName: 'Enlarge Your Pencil',
    description:
      'Придать цели на время способность делать оружие тяжелым на время (потребуется активация эффекта через qr-код). Чем больше Мощь, тем дольше сроки готовности и использования',
    // 519
    // время каста 30 минут, заклинание на T1=Мощь*5 минут делает оружие тяжелым. Маг отдает заказчику красную ленту (как маркер тяжелого оружия из правил по боевке) и привязанный к ней qr-код (как активатор артефакта, и он же содержит срок годности T2 = Мощь*20 минут). То есть в течение периода Т2 можно один раз активировать артефакт и тогда в течение Т1 оружие будет тяжелым
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'stone-skin',
    humanReadableName: 'Stone skin',
    description:
      'Придать цели способность получить тяжелую броню на ограниченное время (потребуется активация эффекта через qr-код). Чем больше Мощь, тем дольше сроки готовности и использования',
    // 520
    // время каста 30 минут, заклинание на Т1=Мощь*3 минут дает цели защиту от тяжелого оружия. Маг отдает заказчику красную ленту (как маркер защиты от тяжелого оружия из правил по боевке) и привязанный к ней qr-код (как активатор артефакта, и
    // он же содержит срок годности Т2= Мощь*20 минут). Активировать можно один раз
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'avalanche',
    humanReadableName: 'Avalanche',
    description: 'Один раз снять со всех в реале в этой локации хиты. Чем больше Мощь, тем больше снимется',
    // 521
    // время каста 5 минут, разовое уменьшение всем персонажам, присутствующим в реале в текущей локации, максимальных хитов на N с задержкой в 30-5*N секунд. N=Мощь/2 (не меньше 1)
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'birds',
    humanReadableName: 'Birds',
    description:
      'Каждую минуту, пока не пройдет заклинание, снимать со всех в реале в этой локации по 1 хиту. Чем больше Мощь, тем больше срок',
    // 522
    // время каста 10 минут, в течение T минут каждые 60 секунд у всех присутствующих в реале в текущей локации на данный момент максимальные хиты уменьшаются на 1 на срок 30 минут. Если максимальные хиты уменьшились таким образом до нуля, то персонаж оказывается в тяжране. T=Мощь*3
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'cacophony',
    humanReadableName: 'Cacophony',
    description:
      'Каждую минуту, пока не пройдет заклинание, снимать со всех в астрале в этой локации по хиту. Чем больше Мощь, тем больше срок',
    // 523
    // время каста 10 минут, после активации заклинания в течение T минут каждые 60 секунд у всех присутствующих в астрале в этой локации на данный момент максимальные хиты астрального тела (ат) уменьшаются на 1 на срок 30 минут. Если максимальные хиты (ат) уменьшились таким образом до нуля, то персонажа выбрасывает из астрала. T=Мощь*5
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'healton',
    humanReadableName: 'Healton',
    description:
      'Каждые 3 минуты, пока не пройдет заклинание, все в реале в этой локации восстанавливают хиты до максимума. Чем больше Мощь, тем больше срок',
    // 524
    // время каста 5 минут, после активации заклинания в течение T минут каждые 180 секунд все присутствующие в реале в текущей локации на данный момент восстанавливают текущие хиты до максимума. T=Мощь*20
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'sage-agains-the-machine',
    humanReadableName: 'Sage against the machine',
    description:
      'Каждую минуту, пока не пройдет заклинание, снимать со всех в реале в этой локации хиты пропорционально количеству имплантов. Чем больше Мощь, тем больше срок',
    // 525
    // время каста 15 минут, после активации заклинания в течение T минут каждые 60 секунд у всех присутствующих в реале в текущей локации текущие хиты уменьшаются на √X. X - число имплантов у каждой конкретной жертвы. T=Мощь*3
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'da-mage',
    humanReadableName: 'daMage',
    description:
      'Каждую минуту, пока не пройдет заклинание, у всех в реале в этой локации Откат увеличивается на их Магию/2. Чем больше Мощь, тем больше срок',
    // 526
    // каст занимает 15 минут, после активации заклинания в течение T минут каждые 60 секунд все, присутствующие в реале в этой локации И имеющие характеристику Магия>0, получают Откат (дополнительно к имеющемуся), равный их Магии/2 (округленный вверх). Т=Мощь*3
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'trackpoint',
    humanReadableName: 'Trackpoint',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последние несколько минут.  Чем больше Мощь, тем точнее будут данные об аурах заклинателей',
    // 527
    // время каста 2 минуты. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 10+Мощь минут - список (название заклинания,  Мощь, Откат, (10+N)% ауры творца, пол и метарасу творца). N=Мощь*5, но не более 40
    // TODO(aeremin): Double-check the implementation
    eventType: trackpointSpell.name,
  },

  {
    id: 'trackball',
    humanReadableName: 'Trackball',
    description:
      'Получить данные обо всех заклинаниях, обнаруженных в этой локации за последний час. Чем больше Мощь, тем точнее будут данные об аурах заклинателей',
    // 528
    // время каста 5 минут. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в последние 60 минут - список (название заклинания,  Мощь, Откат, (20+N)% ауры творца, пол и метарасу творца). N=Мощь*10, но не более 60
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'tempus-fugit',
    humanReadableName: 'Tempus Fugit',
    description:
      'Единоразово сдвинуть следы всех заклинаний за последние несколько минут на несколько минут в прошлое. Чем больше Мощь, тем больше следов захватит заклинание и тем дальше сдвинет',
    // 530
    // время каста 5 минут. При активации заклинания в текущей локации у всех заклинаний с датой активации позже, чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
    // Пример: заклинание Fireball было сотворено в 10:42. В 10:45 минут маг1 кастует поверх него заклинание Tempus Fugit, T1=10, T2=10. Теперь согласно следу у заклинания Fireball время активации станет 10:32 минуты. И когда в 10:55 минут маг2 захочет считать все заклинания на глубину 20 минут, то Fireball он уже не увидит. А без Tempus Fugit увидел бы.
    // В то же время, если маг1 в 10:50 минут захочет сдвинуть метку Fireball еще дальше в прошлое, и у него будет такое же T1=10, то он уже не сможет этого сделать (потому что 10:50-10=10:40, и Fireball уже не попадает в область видимости)
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'brasilia',
    humanReadableName: 'Brasilia',
    description:
      'Пока не кончится заклинание, все следы всех заклинаний, попадающих в интервал "последние 10 минут", будут каждую минуту сдвигаться в прошлое на 5 минут. Чем больше Мощь, тем больше срок',
    // 531
    // время каста 10 минут. В течение Мощь*8 минут даты активации всех заклинаний с датой "sysdate - 1/24/60/60" каждые 60с сдвигаются в прошлое на 300с минут.
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'eh-bien',
    humanReadableName: 'Eh bien',
    description:
      'Получить информацию о тех, кто был в этой локации в интервале, содержащем указанный момент времени. Чем больше Мощь, тем больше интервал',
    // 534
    // Заклинание для расследований. Маг указывает конкретный момент и получает такой текстовый лог по интервалу длиной T, центром которого является указанный момент:
    // “0-5 минут из интервала - такие-то [раса-пол-кусок ауры-лайфстайл, раса-пол-кусок ауры-лайфстайл, раса-пол-кусок ауры-лайфстайл...], 5-10 минут - такие-то… и тд”
    // T=Мощь*5 минут
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'beacon',
    humanReadableName: 'Beacon',
    description:
      'Пока не кончится заклинание, в эту локацию будут созываться духи из соседних (слабые духи проще). Чем больше Мощь, тем больше срок',
    // 535
    // время каста 5 минут. В течение Мощь*5 минут свободные духи из соседних локаций будут каждые 20с с вероятностью (100-W/10)/100 двигаться в текущую. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'run-spirit-run',
    humanReadableName: 'Run, spirit, run',
    description:
      'Пока не кончится заклинание, из этой локации будут распугиваться духи (слабые духи проще). Чем больше Мощь, тем больше срок',
    // 536
    // время каста 10 минут. В течение Мощь*5 минут свободные духи из текущей локации будут каждые 20с с вероятностью (100-W/10)/100 изгоняться в соседнюю. W - это текущая сопротивляемость каждого конкретного духа, поэтому шанс каждый раз определяется отдельно для каждого духа.
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'input-stream',
    humanReadableName: 'InputStream',
    description:
      'Пока не кончится заклинание, мана из соседних локаций будет призываться в эту  (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    // 537
    // время каста 10 минут. В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью 100-Мощь*20) вытянуть 1 уровень плотности маны из случайной соседней локации (там понизится, тут повысится).
    // TODO(aeremin): Add proper implementation
    eventType: dummyManaControlSpell.name,
  },

  {
    id: 'output-stream',
    humanReadableName: 'OutputStream',
    description:
      'Пока не кончится заклинание, мана из этой локации будет изгоняться в соседние (с некоторой вероятностью). Чем больше Мощь, тем больше срок и вероятность',
    // 538
    // время каста 10 минут. В течение Мощь*3 минут каждые 60с будет сделана попытка (с вероятностью 100-Мощь*20) выгнать 1 уровень плотности маны в случайную соседнюю локацию (там понизится, тут повысится).
    // TODO(aeremin): Add proper implementation
    eventType: dummyManaControlSpell.name,
  },

  {
    id: 'mosquito-tree',
    humanReadableName: 'Mosquito Tree',
    description: 'Создать генератор духов, при активации надо сосканировать qr-код человека. Чем больше Мощь, тем сильнее духи',
    // 539
    // время каста 60 минут. В течение 60*24*2 минут доступно неограниченное число активаций. При активации необходимо сосканировать qr-код мясного тела цели, цель теряет один текущий хит, и если цель подходит под случайным образом выбранный на
    // стадии каста метатип (норм/эльф/гном/орк/тролль) - то в этой локации создается дух (хиты: floor(Мощь/2)+1, способности: Arrowgant, Stand up and fight для Мощи < 5, иначе дополнительно Trollton)
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'tweet-tweet-little-bird',
    humanReadableName: 'Tweet-tweet little bird',
    description:
      'Установить контакт с выбранным из присутствующих духом. Узнать часть его ауры. Послать ему сообщение. Получить от него сообщение',
    // 540
    // время каста 1мин, маг подробнее анализирует указанного  духа (выбранного из списка, где перечислены присутствующие сейчас в этой локации духи - по имени. Не по ауре!). Маг узнает случайные 10% его ауры (не просто 2 символа, а с пониманием на какой позиции они находятся), может послать ему какое-то сообщение (задает его при касте) и в ответ в зависимости от текущего уровня дружелюбия духа к магу получит текстовые сообщения какого-то уровня доверия (из заранее записанных духу).
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'feed-the-cat',
    humanReadableName: 'Feed the cat',
    description: 'На время понизить Сопротивляемость указанного духа. Чем больше Мощь, тем больше срок и эффект',
    // 541
    // время каста 30с, маг на время Мощь*5 минут понижает на Мощь*10 текущую Сопротивляемость указанного (выбранного из списка) духа.
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'tame-the-dog',
    humanReadableName: 'Tame the dog',
    description: 'понизить Сопротивляемость духа по отношению к себе',
    // 542
    // время каста 10мин, маг перманентно понижает Сопротивляемость указанного (выбранного из списка) духа к себе на 10, что приводит к перманентному увеличению Сопротивляемости этого духа ко всем остальным.
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'whip-the-horse',
    humanReadableName: 'Whip the horse',
    description: 'Повысить Сопротивляемость указанного духа. Чем больше Мощь, тем больше эффект',
    // 543
    // время каста 10мин, маг перманентно увеличивает Сопротивляемость духа на 10.
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'spirit-suit',
    humanReadableName: 'Spirit Suit',
    description:
      'На некоторое время получить возможность попытаться поймать духа, что позволит на протяжении определенного периода переключиться в его тело. Существует штраф за неудачу. Чем больше Мощь, тем больше вероятность поимки и все сроки.',
    // 544
    // время каста 5 минут. В течение T1 минут можно сделать одну попытку с вероятностью (-R*5-W+M*10+F*10)/100 взять указанного духа под контроль на время T2. То есть маг заранее заряжает это заклинание, и потом в нужной локации во время активации выбирает нужного духа из списка присутствующих (в астрале или реале) духов (в том числе, контролируемых другими магами). Если попытка удалась, то захваченный дух на время Т2 исчезает из астрала и при этом доступен автору заклинания как тело для
    // переключения в него. У духа может быть иное число хитов (не обязательно больше), а также другие свойства. W это текущая Сопротивляемость духа. R - ранг духа.  F - уровень способности мага “Дружелюбие духов”. Если попытка взять духа под контроль не удалась, то на Магию ловца накладывается штраф - величиной F на время T2. T1=Мощь*10 минут. T2=Мощь*15 минут. M=Мощь
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'exorcizamus',
    humanReadableName: 'Exorcizamus',
    description: 'Попытаться изгнать выбранного из присутствующих духа',
    // 545
    // время каста 3 минуты, с вероятностью (-R*5-W+M*5+F*10)/100 изгоняет указанного (выбранного из списка) духа, присутствующего в этой локации, в другой пласт реальности  (то есть дух не обнаруживается ни в одной локации полигона, и нацеленные на него по ауре симпатические заклинания не могут найти такую цель и рушатся) на время T. T=Мощь*30 минут. М=Мощь
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    eventType: spiritsRelatedSpell.name,
  },

  {
    id: 'tekel',
    humanReadableName: 'Tekel',
    description: 'Узнать часть ауры выбранного объекта - текущая локация/один из присутствующих духов/не сопротивляющийся человек',
    // 546
    // каст занимает 10 минут, маг узнает часть ауры цели (100% для текущей локации/60% для выбранного из списка присутствующих в этой локации духа/90% для метачеловека, не сопротивляющегося сканированию своего qr).
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'panopticon',
    humanReadableName: 'Panopticon',
    description:
      'Узнать часть ауры всех присутствующих в этой локации в реале и в астрале людей. Чем больше Мощь, тем больший фрагмент аур удастся прочитать',
    // 547
    // каст занимает 5 минут. Маг получает в приложении текстом список неточных слепков (10%+N*5%-R*5%) ауры всех, кто присутствует в локации на момент активации заклинания. N=Мощь. R это уровень сопротивления сканированию ауры (маска ауры) каждой цели.
    // TODO(aeremin): Add proper implementation
    eventType: dummyAreaSpell.name,
  },

  {
    id: 'nothing-special',
    humanReadableName: 'Nothing special',
    description: 'Временно усилить цели маску ауру. Чем больше Мощь, тем больше защита',
    // 548
    // каст занимает 5 минут. У цели в течение 120 минут маска ауры увеличена на Мощь*2
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'sense-of-essence',
    humanReadableName: 'Sense of essence',
    description: 'Узнать ауру того, кому принадлежала кровь (qr-код дозы которой был просканирован)',
    // 549
    // каст занимает 5 минут. Маг сканирует QR-код чипа крови (тот при этом расходуется) и получает текстом ауру того, кому эта кровь принадлежит.
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'odus',
    humanReadableName: 'Odus',
    description:
      'Временно понизить Резонанс цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 551
    // каст занимает 10 минут, у цели на время T понижается Резонанс на N. T=Мощь*10 минут. N=Мощь-1, но не меньше 1
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'frog-skin',
    humanReadableName: 'Frog skin',
    description:
      'Временно понизить Харизму цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 552
    // каст занимает 10 минут, у цели на время T понижается Харизма на N. T=Мощь*10 минут. N=Мощь-1, но не меньше 1
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'charm',
    humanReadableName: 'Charm',
    description:
      'Временно повысить Харизму цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 553
    // каст занимает 10 минут, у цели на время T повышается Харизма на N. T=Мощь*10 минут. N=Мощь-2, но не меньше 1
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'shtopping',
    humanReadableName: 'Shtopping',
    description:
      'Временно повысить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 554
    // каст занимает 10 минут, у цели на время T на N% повышается стоимость любых покупок (через скоринг?).  T=Мощь*10 минут. N=Мощь*10, но не меньше 10
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'tax-free',
    humanReadableName: 'Tax free',
    description:
      'Временно понизить стоимость всех покупок цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 555
    // каст занимает 10 минут, у цели на время T на N% понижается стоимость любых покупок (через скоринг?). T=Мощь*10 минут. N=Мощь*10, но не больше 90
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },

  {
    id: 'dumpty-humpty',
    humanReadableName: 'Dumpty-Humpty',
    description:
      'Временно понизить штраф от дамп-шока цели, указанной добровольно предоставленным qr-кодом или с помощью ауры через симпатическую магию. Чем больше Мощь, тем больше срок и эффект',
    // 556
    // каст занимает 10 минут, у цели на время T на N% понижается штраф от дамп-шока. T=Мощь*10 минут. N=Мощь, но не больше 10
    // TODO(aeremin): Add proper implementation
    eventType: dummySpell.name,
  },
];

export const kAllSpells: Map<string, Spell> = (() => {
  const result = new Map<string, Spell>();
  kAllSpellsList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
