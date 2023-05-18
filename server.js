import * as fs from 'fs';
// dotenv alternative
if (fs.existsSync('./.env')) {
  fs.readFileSync('./.env', 'utf8').split(/[\r\n]+/).forEach((_eachEnv) => {
    const parts = _eachEnv.split('=');
    process.env[parts[0]] = parts[1];
  });
}

import * as path from 'path';
import express from 'express';
const app = express();
import bodyParser from 'body-parser';
import { DetectiveStoryGameInterface } from './game-core.mjs';

const myGameInstance = new DetectiveStoryGameInterface({ log: true });

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use(express.static('public'));

app.get('/', (req, res) => {
  console.log.bind(req);
  res.sendFile(path.resolve('./index.html'));
});

app.post('/text-gen', async (req, res) => {
  if (!req.body.type) return res.status(400).send('Missing "type" POST variable in /text-gent endpoint.');
  if (!['arrive', 'interrogation'].includes(req.body.type)) return res.status(400).send('"type" POST variable in /text-gent should be: "arrive", "interrogation".');

  const textGenParams = {
    type: req.body.type,
    authorStyle: req.body.authorStyle,
  };
  switch (req.body.type) {
    case 'arrive':
      if (!req.body.countryEs) return res.status(400).send('Missing "countryEs" POST variable in /text-gent endpoint.');
      if (!req.body.cityEs)    return res.status(400).send('Missing "cityEs" POST variable in /text-gent endpoint.');
      if (!req.body.thiefName) return res.status(400).send('Missing "thiefName" POST variable in /text-gent endpoint.');
      if (!req.body.lootName)  return res.status(400).send('Missing "lootName" POST variable in /text-gent endpoint.');
      textGenParams.countryEs = req.body.countryEs;
      textGenParams.cityEs = req.body.cityEs;
      textGenParams.thiefName = req.body.thiefName;
      textGenParams.lootName = req.body.lootName;
      break;
    case 'interrogation':
      if (!req.body.witnessName)  return res.status(400).send('Missing "witnessName" POST variable in /text-gent endpoint.');
      if (!req.body.witnessQuirk) return res.status(400).send('Missing "witnessQuirk" POST variable in /text-gent endpoint.');
      if (!req.body.clue) return res.status(400).send('Missing "clue" POST variable in /text-gent endpoint.');
      textGenParams.witnessName = req.body.witnessName;
      textGenParams.witnessQuirk = req.body.witnessQuirk;
      textGenParams.clue = req.body.clue;
      break;
  }
  myGameInstance.textGen(textGenParams)
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      console.log(err);
      res.status(422).send('Couldn\'t generate text.');
    });
});

app.post('/image-gen', (req, res) => {
  if (!req.body.type) return res.status(400).send('Missing "type" POST variable in /image-gen endpoint.');
  if (!['initial', 'arrive', 'interrogation'].includes(req.body.type)) return res.status(400).send('"type" POST variable in /image-gen should be: "initial", "arrive" or "interrogation".');
  if (!req.body.illustrationStyle) return res.status(400).send('Missing "illustrationStyle" POST variable in /image-gen endpoint.');

  const imageGenParams = {
    type: req.body.type,
    illustrationStyle: req.body.illustrationStyle,
  };
  switch (req.body.type) {
    case 'arrive':
      if (!req.body.countryEn) return res.status(400).send('Missing "countryEn" POST variable in /image-gen endpoint.');
      imageGenParams.countryEn = req.body.countryEn;
      break;
  }

  myGameInstance.imageGen(imageGenParams)
    .then((imageUrl) => {
      res.send({ imageUrl });
    })
    .catch((err) => {
      console.log('Error getting image from OpenAI');
      res.status(500).send({ imageUrl: '' });
    });
});

const port = process.env.PORT || 3333;
app.listen((port), () => {
  console.log(`App listening on port ${port}`);
});
