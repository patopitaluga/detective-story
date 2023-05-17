import stages from './enum_stages.json' assert { type: 'json' };
import authorsJson from './enum_writers.json' assert { type: 'json' };
import countriesJson from './enum_countries.json' assert { type: 'json' };
import thievesJson from './enum_thieves.json' assert { type: 'json' };
import witnessesJson from './enum_witnesses.json' assert { type: 'json' };
import quirksJson from './enum_quirks.json' assert { type: 'json' };
import illustrationStyleJson from './enum_illustration_style.json' assert { type: 'json' };

const TRAVELING_TIME = 6;

const makeid = (_) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < _) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 *
 * @param {array} theArray -
 * @param {object} notThisOne - Optional, to skip a result, to avoid repeating options.
 */
const getByChance = (theArray, notThisOne) => {
  if (typeof notThisOne === 'undefined') notThisOne = {};

  // if chance not set in the json then all are equal
  if (!theArray[0].chance) theArray = theArray.map((_) => ({ ..._, chance: 100 / theArray.length, }));

  let i = -1;
  theArray[-1] = {};
  while (JSON.stringify(theArray[i] === JSON.stringify(notThisOne))) {
    const randomPercent = Math.floor(Math.random() * 100) + 1;
    let sumChance = 0;
    for (i = 0; i < theArray.length; i++) {
      sumChance += theArray[i].chance;
      if (sumChance > randomPercent) return theArray[i];
    }
  }
  return theArray[i];
}

/**
 * To avoid getting repeated elements;
 * @param {array} theArray -
 * @param {number} howManyElements -
 */
const arrayByChance = (theArray, howManyElements) => {
  if (!howManyElements) throw new Error('[arrayByChance] missing param "howManyElements"');

  const manyByChance = [];
  if (!theArray[0].chance) theArray = theArray.map((_) => ({ ..._, chance: 100 / theArray.length, }));
  for (let r = 0; r < howManyElements; r++) {
    let byChance = getByChance(theArray);
    while(manyByChance.map((_) => JSON.stringify(_)).includes(JSON.stringify(byChance))) {
      byChance = getByChance(theArray);
    }
    manyByChance.push(byChance);
  }
  return manyByChance;
}

const shuffleArray = (theArray) => {
  let currentIndex = theArray.length;
  let randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [theArray[currentIndex], theArray[randomIndex]] = [theArray[randomIndex], theArray[currentIndex]];
  }
  return theArray;
}

const initialCountry = getByChance(countriesJson.countries); // {object}
const runawayCountries = arrayByChance(countriesJson.countries, 4);

export const store = Vue.reactive({
  // gameStage: stages.LOADING_ASSETS,
  gameStage: stages.INTRO,
  agentName: '',
  skillPoints: 18,
  agentStrenth: 6,
  agentDexterity: 6,
  agentAiming: 6,
  missionHours: 48,
  notepadText: '',
  illustrationUrl: '',
  illustrationStyle: getByChance(illustrationStyleJson).style,
  authorStyle: getByChance(authorsJson).author, // {string}
  initialCountry: initialCountry,
  thiefName: getByChance(thievesJson).thief, // {string}
  lootName: getByChance(initialCountry.items.map((_) => ({ name: _ }))).name, // {string}
  currentCountry: {},
  witnesses: arrayByChance(witnessesJson, 4),
  witnessesQuirks: arrayByChance(quirksJson, 4),
  runawayCountries: runawayCountries,
  countriesToTravel: [
    shuffleArray([runawayCountries[0], getByChance(countriesJson.countries, runawayCountries[0]), getByChance(countriesJson.countries, runawayCountries[0])]),
    shuffleArray([runawayCountries[1], getByChance(countriesJson.countries, runawayCountries[1]), getByChance(countriesJson.countries, runawayCountries[1])]),
    shuffleArray([runawayCountries[2], getByChance(countriesJson.countries, runawayCountries[2]), getByChance(countriesJson.countries, runawayCountries[2])]),
    shuffleArray([runawayCountries[3], getByChance(countriesJson.countries, runawayCountries[3]), getByChance(countriesJson.countries, runawayCountries[3])]),
  ],
  witnessTestimonies: 0,
  rightTravels: 0,
  lastCountry: 0,

  setGameStage: (_) => {
    store.gameStage = _;
    if (_ === stages.GAME_LOOP_WITNESS) {
      store.setNotepadText({
        type: 'interrogation',
        witnessName: store.witnesses[store.witnessTestimonies].witness,
        witnessQuirk: store.witnessesQuirks[store.witnessTestimonies].quirk,
        clue: store.runawayCountries[store.rightTravels].clues[0],
      }, 'Interrogando…');
      store.witnessTestimonies++;
    }
    if (_ === stages.MISSION_BRIEFING)
      store.generateIllustration({
        type: 'arrive',
        countryEn: store.initialCountry.en,
        illustrationStyle: store.illustrationStyle,
      });
  },
  setAgentName: (_) => {
    store.agentName = _;
    store.setGameStage(stages.CHARACTER_CREATION);
  },
  setStrength: (_) => {
    store.agentStrenth = _;
    store.skillPoints -= _;
    store.setGameStage(stages.CHARACTER_CREATION2);
  },
  setDexterity: (_) => {
    store.agentDexterity = _;
    store.skillPoints -= _;
    store.setGameStage(stages.CHARACTER_CREATION3);
  },
  setAiming: (_) => {
    store.agentAiming = _;
    store.skillPoints -= _;
    store.setGameStage(stages.MISSION_BRIEFING);
  },

  subtractMissionHours: (_) => {
    store.missionHours -= _;
  },

  /**
   *
   */
  setNotepadText: (options, waitMessage = 'Escribiendo…') => {
    if (typeof options === 'undefined') throw new Error('[setNotepadText] missing "options" param.');
    if (typeof options !== 'object') throw new Error('[setNotepadText] "options" param should be an object.');
    if (typeof options.type === 'undefined') throw new Error('[setNotepadText] missing "options.type" param.');
    if (typeof options.type !== 'string') throw new Error('[setNotepadText] "options.type" param should be a string.');
    if (!['arrive', 'interrogation'].includes(options.type)) throw new Error('[setNotepadText] "options.type" param should be: "arrive", "interrogation".');

    const queryParams = {
      authorStyle: store.authorStyle,
      type: options.type,
    };
    switch (options.type) {
      case 'arrive':
        if (typeof options.countryEs === 'undefined' || !options.countryEs) throw new Error('[setNotepadText] missing "options.countryEs" param.');
        queryParams.countryEs = options.countryEs;
        queryParams.cityEs = options.cityEs;
        queryParams.thiefName = store.thiefName;
        queryParams.lootName = store.lootName;
        break;
      case 'interrogation':
        if (typeof options.witnessName === 'undefined' || !options.witnessName) throw new Error('[setNotepadText] missing "options.witnessName" param.');
        if (typeof options.witnessQuirk === 'undefined' || !options.witnessQuirk) throw new Error('[setNotepadText] missing "options.witnessQuirk" param.');
        queryParams.witnessName = options.witnessName;
        queryParams.witnessQuirk = options.witnessQuirk;
        queryParams.clue = options.clue;
        break;
    }

    store.notepadText = waitMessage;
    fetch(`/text-gen?r=${makeid(5)}`, {
      method: 'POST',
      body: JSON.stringify(queryParams),
      headers: { 'Content-Type': 'application/json', },
    })
      .then((rawResponse) => rawResponse.text())
      .then((_) => {
        let prefix = '';
        if (options.type === 'interrogation') prefix = '<p>Declaración del testigo:</p>';
        store.notepadText = _.split('\n\n').map(s => `<p>${s}</p>`).join('');
      })
      .catch((err) => console.error(err));
  },

  /**
   *
   * @param {object} _
   */
  goToCountry: (_) => {
    store.setNotepadText({
      type: 'arrive',
      countryEs: _.es,
      cityEs: _.cityEs,
    });
    soundEffects.plane.play();
    setTimeout(() => {
      soundEffects.plane.pause();
      soundEffects.plane.currentTime = 0;
    }, 3000);
    store.missionHours -= TRAVELING_TIME;
    store.setGameStage(stages.GAME_LOOP);
    store.currentCountry = _;
  },

  /**
   * @param {object} _ -
   */
  generateIllustration: (_) => {
    if (typeof _?.type !== 'string') throw new Error('[generateIllustration] missing "type" param.');
    if (typeof _?.illustrationStyle !== 'string') throw new Error('[generateIllustration] missing "illustrationStyle" param.');

    const imageGenQueryParams = {
      type: _.type,
      illustrationStyle: _.illustrationStyle,
    };
    switch (_.type) {
      case 'arrive':
        if (typeof _?.countryEn !== 'string') throw new Error('[generateIllustration] missing "countryEn" param.');
        imageGenQueryParams.countryEn = _.countryEn;
        break;
    }

    fetch('/image-gen', {
      method: 'POST',
      body: JSON.stringify(imageGenQueryParams),
      headers: { 'Content-Type': 'application/json', },
    })
      .then((rawResponse) => rawResponse.json())
      .then((_) => { store.illustrationUrl = _.imageUrl; })
      .catch((err) => console.error(err));
  },

  playSound: (_) => {
    switch (_) {
      case 'typing':
        soundEffects.typing.play();
        setTimeout(() => {
          soundEffects.typing.pause();
          soundEffects.typing.currentTime = 0;
        }, 1500);
        break;
      default:
        break;
    }
  },
});

const soundEffects = {
  typing: new Audio('./sounds/type-writing-6834.mp3'),
  plane: new Audio('./sounds/jet-plane-flybyflac-14641.mp3'),
};
soundEffects.typing.volume = 0.5;
soundEffects.plane.volume = 0.5;
// soundEffects.typing.addEventListener('canplaythrough', () => store.gameStage = stages.WELCOME, false);
