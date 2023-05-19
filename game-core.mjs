import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import { Configuration, OpenAIApi } from 'openai';
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export class DetectiveStoryGameInterface {
  constructor(configuration) {
    this.log = configuration?.log;
    if (configuration?.logFunction)
      this.logFunction = configuration?.logFunction;
    else
      this.logFunction = (_) => console.log(_);
  }

  /**
   *
   * @param {object} options -
   * @param {string} options.type -
   * @param {string} options.authorStyle - Required for type 'arrive' and 'interrogation'.
   * @param {string} options.thiefName - Required for type 'arrive'.
   * @param {string} options.lootName - Required for type 'arrive'.
   * @param {string} options.witnessName - Required for type 'interrogation'.
   * @returns {Promise<string>}
   */
  textGen(options) {
    let prompt;
    let temperature;
    switch (options.type) {
      case 'arrive':
        if (!options.countryEs) throw new Error('[textGen] missing "countryEs" param.');
        if (!options.cityEs) throw new Error('[textGen] missing "cityEs" param.');
        if (!options.thiefName) throw new Error('[textGen] missing "thiefName" param.');
        if (!options.lootName) throw new Error('[textGen] missing "lootName" param.');
        prompt = `En el estilo de ${options.authorStyle} escribe los primeros dos párrafos de un capítulo de una novela policial cómica, en primera persona, tiempo pasado. En ella, un detective describe la llegada a ${options.cityEs} ${options.countryEs}, el clima es niebla, ha llegado tras la pista del ladrón ${options.thiefName}, que ha robado ${options.lootName}.`
        temperature = 1;
        break;
      case 'interrogation':
        if (!options.witnessName) throw new Error('[textGen] missing "witnessName" param.');
        if (!options.witnessQuirk) throw new Error('[textGen] missing "witnessQuirk" param.');
        if (!options.clue) throw new Error('[textGen] missing "clue" param.');
        prompt = `En el estilo de ${options.authorStyle} escribe una respuesta a un interrogatorio en una novela policial cómica. Solo la respuesta del testigo, la pregunta está implicita. Dirá que oyó que el sospechoso ${options.clue}. Una particularidad de este testigo es que ${options.witnessQuirk}.`
        temperature = 0;
        break;
    }

    if (!prompt) throw new Error('Prompt undefined in textGen function. Might be wrong type.')
    if (this.log) console.log(`Text generation. Prompt: ${prompt}`);

    /* let prevCache;
    try {
      prevCache = fs.readFileSync(path.resolve(__dirname, './cache.json'), 'utf8');
    } catch (error) {
      prevCache = '[]';
    }
    const cacheJson = JSON.parse(prevCache);
    const existing = cacheJson.find((_) => _.prompt === prompt);*/
    return new Promise((resolve, reject) => {
      /* if (existing) {
        resolve(existing.anwser);
      } else {*/
        const start = Date.now();
        openai.createChatCompletion({
          messages: [{
            role: 'user',
            content: prompt,
          }],
          model: 'gpt-3.5-turbo', // alt 'gpt-3.5-turbo-0301',
          max_tokens: 400,
          temperature,
        })
          .then((_) => {
            if (this.log) console.log('-------------------');
            if (this.log) console.log('Response:');
            if (this.log) console.log(JSON.stringify(_.data.choices));
            if (this.log) console.log(`-- Execution time: ${Math.floor((Date.now() - start) / 1000)} seconds`);

            resolve(_.data.choices[0].message.content.trim());
            /* cacheJson.push({
              prompt,
              anwser: _.data.choices[0].message.content.trim().trim(),
            });
            fs.writeFileSync(path.resolve(__dirname, './cache.json'), JSON.stringify(cacheJson, null, 2)); */
          })
          .catch((_) => reject(_));
        /*
        openai.createCompletion({
          prompt,
          model: 'text-davinci-003',
          max_tokens: 1000,
          temperature: 1,
        })
          .then((_) => {
            if (this.log) console.log(`Response: ${_.data.choices[0].text.trim()}`);
            if (this.log) console.log(`Execution time: ${Math.floor((Date.now() - start) / 1000)} seconds`);

            resolve(_.data.choices[0].text.trim());
            cacheJson.push({
              prompt,
              anwser: _.data.choices[0].text.trim(),
            });
            fs.writeFileSync(path.resolve(__dirname, './cache.json'), JSON.stringify(cacheJson, null, 2));
          })
          .catch((_) => reject(_));
        */
      // }
    });
  }

  /**
   *
   * @param {object} options -
   * @param {string} options.type - Required
   * @returns {Promise<string>}
   */
  imageGen(options) {
    return new Promise((resolve, reject) => {
      if (!options?.type) throw new Error('[DetectiveStoryGameInterface.imageGen] missing "type" param.');
      if (!options?.illustrationStyle) throw new Error('[DetectiveStoryGameInterface.imageGen] missing "illustrationStyle" param.');

      let prompt;
      switch (options.type) {
        case 'initial':
          const posiblePrompts = [
            `In ${options.illustrationStyle} style, generate an image of a stereotypical american detective the hall of the FBI headquarters.`,
            `In ${options.illustrationStyle} style, generate an image of a stereotypical american detective in front of the FBI building.`,
            `In ${options.illustrationStyle} style, generate an image of a stereotypical american detective getting a coffee from a vending machine.`,
            `In ${options.illustrationStyle} style, generate an image of a stereotypical american detective talking to a coworker in front of a water dispenser in an office.`,
          ];
          prompt = posiblePrompts[Math.floor(Math.random() * posiblePrompts.length)];
          break;
        case 'arrive':
          if (!options?.countryEn) throw new Error('[DetectiveStoryGameInterface.imageGen] missing "countryEn" param.');
          prompt = `In ${options.illustrationStyle} style, generate an image of a stereotypical american detective in ${options.countryEn}. The background should include a typical scene in ${options.countryEn}. If that country have a recognizable place or monument it should be visible.`;
          break;
      }
      if (!prompt) throw new Error('[DetectiveStoryGameInterface.imageGen] Can\'t generate prompt with current params.');

      if (this.log) console.log(`Image generation. Prompt: ${prompt}`);
      openai.createImage({
        prompt,
        n: 1, // how many images
        size: '512x512', // Available: ['256x256', '512x512', '1024x1024']
      })
        .then((_) => resolve(_.data.data[0].url))
        .catch((err) => {
          reject(err);
        });
    });
  }
};
