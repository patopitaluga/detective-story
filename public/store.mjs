import stages from './enum_stages.json' assert { type: 'json' };
import authorsJson from './enum_writers.json' assert { type: 'json' };
import countriesJson from './enum_countries.json' assert { type: 'json' };
import thievesJson from './enum_thieves.json' assert { type: 'json' };
import witnessesJson from './enum_witnesses.json' assert { type: 'json' };
import quirksJson from './enum_quirks.json' assert { type: 'json' };
import illustrationStyleJson from './enum_illustration_style.json' assert { type: 'json' };

const TRAVELING_TIME = 6;

import { helpers } from './helpers.mjs';

const initialCountry = helpers.getByChance(countriesJson.countries); // {object}
const runawayCountries = helpers.arrayByChance(countriesJson.countries, 4);
const illustrationStyle = helpers.getByChance(illustrationStyleJson).style;
const sessionHash = helpers.makeid(5);
const fetchCache = [];

export const store = Vue.reactive({
  // gameStage: stages.LOADING_ASSETS,
  gameStage: stages.INTRO,
  agentName: '',
  skillPoints: 24,
  agentDexterity: 6,
  agentPersuasion: 6,
  agentObservation: 6,
  agentAiming: 6,
  missionHours: 48,
  notepadText: '',
  illustrationUrl: '',
  authorStyle: helpers.getByChance(authorsJson).author, // {string}
  initialCountry: initialCountry,
  thiefName: helpers.getByChance(thievesJson).thief, // {string}
  lootName: helpers.getByChance(initialCountry.items.map((_) => ({ name: _ }))).name, // {string}
  currentCountry: {},
  countriesArriveDisplay: [
    { countryEs:'', text: '', image: '', },
    { countryEs:'', text: '', image: '', },
    { countryEs:'', text: '', image: '', },
    { countryEs:'', text: '', image: '', },
  ],
  witnesses: helpers.arrayByChance(witnessesJson, 4),
  witnessesQuirks: helpers.arrayByChance(quirksJson, 4),
  runawayCountries: runawayCountries,
  countriesToTravel: [
    helpers.shuffleArray([runawayCountries[0], helpers.getByChance(countriesJson.countries, runawayCountries[0]), helpers.getByChance(countriesJson.countries, runawayCountries[0])]),
    helpers.shuffleArray([runawayCountries[1], helpers.getByChance(countriesJson.countries, runawayCountries[1]), helpers.getByChance(countriesJson.countries, runawayCountries[1])]),
    helpers.shuffleArray([runawayCountries[2], helpers.getByChance(countriesJson.countries, runawayCountries[2]), helpers.getByChance(countriesJson.countries, runawayCountries[2])]),
    helpers.shuffleArray([runawayCountries[3], helpers.getByChance(countriesJson.countries, runawayCountries[3]), helpers.getByChance(countriesJson.countries, runawayCountries[3])]),
  ],
  witnessTestimonies: 0,
  rightTravels: -1,
  lastCountry: 0,
  countQuery: 0, // to ignore a response when the next one has already been

  initialize: () => {
    // cache start text
    store.generateIllustration({
      type: 'initial',
      illustrationStyle,
    }) // get the first image
      .then((initialImageUrl) => {
        const img = new Image();
        img.src = initialImageUrl;
        store.illustrationUrl = initialImageUrl;
        store.generateIllustration({
          type: 'arrive',
          countryEn: initialCountry.en,
          illustrationStyle,
        }, true) // cache the second
          .then((_) => {
            const img = new Image();
            img.src = _;
            store.countriesArriveDisplay[0].image = _;
          });
      });
  },
  setGameStage: (_) => {
    store.gameStage = _;
    if (_ === stages.CHARACTER_CREATION) {
      // cache
      store.queryTextGen({
        type: 'arrive',
        countryEs: initialCountry.es,
        cityEs: initialCountry.cityEs,
        detectiveName: store.agentName,
      })
        .then((_) => store.setCountriesArriveDisplay(0, {
          countryEs: initialCountry.es,
          text: _,
        }));
    }
    if (_ === stages.GAME_LOOP_INITIAL_COUNTRY) {
      store.notepadText = 'Escribiendo…';
      setTimeout(() => {
        store.notepadText = store.countriesArriveDisplay[store.rightTravels].text;
      }, 2500);
      store.illustrationUrl = store.countriesArriveDisplay[store.rightTravels].image;

      soundEffects.plane.play();
      setTimeout(() => {
        soundEffects.plane.pause();
        soundEffects.plane.currentTime = 0;
      }, 3000);
      store.missionHours -= TRAVELING_TIME;
    }
    if (_ === stages.GAME_LOOP_WITNESS) {
      store.notepadText = 'Interrogando…';
      store.queryTextGen({
        type: 'interrogation',
        witnessName: store.witnesses[store.witnessTestimonies].witness,
        witnessQuirk: store.witnessesQuirks[store.witnessTestimonies].quirk,
        clue:
          helpers.getByChance(store.runawayCountries[store.rightTravels].clues).clue
        ,
      })
        .then((_) => store.notepadText = _);
      store.witnessTestimonies++;
    }
    if (_ === stages.GAME_LOOP_CSI) {
      store.notepadText = 'Investigando…';
      store.queryTextGen({
        type: 'investigation',
        detectiveName: store.agentName,
      })
        .then((_) => store.notepadText = _);
      store.witnessTestimonies++;
    }
  },
  setAgentName: (_) => {
    store.agentName = _;
    store.setGameStage(stages.CHARACTER_CREATION);
  },
  setDexterity: (_) => {
    store.agentDexterity = _;
    store.skillPoints -= _;
    store.setGameStage(stages.CHARACTER_CREATION2);
  },
  setObservation: (_) => {
    store.agentObservation = _;
    store.skillPoints -= _;
    store.setGameStage(stages.CHARACTER_CREATION3);
  },
  setPersuasion: (_) => {
    store.agentPersuasion = _;
    store.skillPoints -= _;
    store.setGameStage(stages.CHARACTER_CREATION4);
  },
  setAiming: (_) => {
    store.agentAiming = _;
    store.skillPoints -= _;
    store.setGameStage(stages.MISSION_BRIEFING);
  },
  setCountriesArriveDisplay: (i, _) => {
    store.countriesArriveDisplay[i] = {
      ...store.countriesArriveDisplay[i],
      ..._,
    };
    // If it's already in this stage then the player was faster than openai
    if (store.gameStage === stages.GAME_LOOP_INITIAL_COUNTRY) {
      store.notepadText = 'Escribiendo…';
      setTimeout(() => {
        store.notepadText = store.countriesArriveDisplay[store.rightTravels].text;
      }, 2500);
    }
  },

  subtractMissionHours: (_) => {
    store.missionHours -= _;
  },

  /**
   * @param {object} options -
   * @returns {Promise<object>}
   */
  queryTextGen: (options) => {
    return new Promise((resolve, reject) => {
      if (typeof options === 'undefined') throw new Error('[queryTextGen] missing "options" param.');
      if (typeof options !== 'object') throw new Error('[queryTextGen] "options" param should be an object.');
      if (typeof options.type === 'undefined') throw new Error('[queryTextGen] missing "options.type" param.');
      if (typeof options.type !== 'string') throw new Error('[queryTextGen] "options.type" param should be a string.');
      if (!['arrive', 'interrogation', 'investigation'].includes(options.type)) throw new Error('[queryTextGen] "options.type" param should be: "arrive", "investigation", "interrogation".');

      const queryParams = {
        authorStyle: store.authorStyle,
        type: options.type,
      };
      switch (options.type) {
        case 'arrive':
          if (typeof options.countryEs === 'undefined' || !options.countryEs) throw new Error('[queryTextGen] missing "options.countryEs" param.');
          if (typeof options.detectiveName === 'undefined' || !options.detectiveName) throw new Error('[queryTextGen] missing "options.detectiveName" param.');
          queryParams.countryEs = options.countryEs;
          queryParams.cityEs = options.cityEs;
          queryParams.detectiveName = options.detectiveName;
          queryParams.thiefName = store.thiefName;
          queryParams.lootName = store.lootName;
          break;
        case 'interrogation':
          if (typeof options.witnessName === 'undefined' || !options.witnessName) throw new Error('[queryTextGen] missing "options.witnessName" param.');
          if (typeof options.witnessQuirk === 'undefined' || !options.witnessQuirk) throw new Error('[queryTextGen] missing "options.witnessQuirk" param.');
          if (typeof options.clue === 'undefined' || !options.clue) throw new Error('[queryTextGen] missing "options.clue" param.');
          queryParams.witnessName = options.witnessName;
          queryParams.witnessQuirk = options.witnessQuirk;
          queryParams.clue = options.clue;
          break;
        case 'investigation':
          if (typeof options.detectiveName === 'undefined' || !options.detectiveName) throw new Error('[queryTextGen] missing "options.detectiveName" param.');
          break;
      }

      const currentQueryNumber = store.countQuery;
      store.countQuery++
      // if (!forCache) store.countQuery++
      /* const inCache = fetchCache.find((_) => {
        return _.body === JSON.stringify(queryParams) && _.body
      });
      fetchCache.push({
        body: JSON.stringify(queryParams),
        status: 'pending',
      }) */
      fetch(`/text-gen?r=${sessionHash}`, {
        cache: 'force-cache',
        method: 'POST',
        body: JSON.stringify(queryParams),
        headers: { 'Content-Type': 'application/json', },
      })
        .then((rawResponse) => rawResponse.text())
        .then((_) => {
          // if (store.countQuery > currentQueryNumber) return;
          let prefix = '';
          if (options.type === 'interrogation') prefix = '<p>Declaración del testigo:</p>';
          resolve(prefix + _.split('\n\n').map(s => `<p>${s}</p>`).join(''));
        })
        .catch((err) => console.error(err));
    });
  },

  /**
   *
   * @param {object} _
   */
  goToCountry: (_) => {
    store.currentCountry = _;

    if (store.gameStage === stages.MISSION_BRIEFING) {
      store.rightTravels++;
      store.setGameStage(stages.GAME_LOOP_INITIAL_COUNTRY);
    }
  },

  /**
   * @param {object} _ -
   * @returns {Promise<string>} - the url.
   */
  generateIllustration: (_) => {
    return new Promise((resolve, reject) => {
      if (typeof _?.type !== 'string') throw new Error('[generateIllustration] missing "type" param.');
      if (typeof _?.illustrationStyle !== 'string') throw new Error('[generateIllustration] missing "illustrationStyle" param.');

      const imageGenQueryParams = {
        type: _.type,
        illustrationStyle: _.illustrationStyle,
      };
      switch (_.type) {
        case 'initial':
          break;
        case 'arrive':
          if (typeof _?.countryEn !== 'string') throw new Error('[generateIllustration] missing "countryEn" param.');
          imageGenQueryParams.countryEn = _.countryEn;
          break;
      }

      fetch(`/image-gen?r=${sessionHash}`, {
        cache: 'force-cache',
        method: 'POST',
        body: JSON.stringify(imageGenQueryParams),
        headers: { 'Content-Type': 'application/json', },
      })
        .then((rawResponse) => rawResponse.json())
        .then((_) => {
          resolve(_.imageUrl);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
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
