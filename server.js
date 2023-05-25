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
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import { DetectiveStoryGameInterface } from './game-core.mjs';
import { telegramWebhookController } from './controllers/ctrl--tg-webhook.mjs';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

let theIOSocket;
io.on('connection', (socket) => {
  theIOSocket = socket;
});
const myGameInstance = new DetectiveStoryGameInterface({
  log: true,
  logFunction: (_) => {
    if (theIOSocket) theIOSocket.emit('message', _);
    console.log(_);
  },
});

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] == 'http')
    res.redirect('https://' + req.headers.host + req.url);
  else
    next();
});

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

app.use(express.static('public'));

app.get('/', (req, res) => {
  console.log.bind(req);
  res.sendFile(path.resolve('./index.html'));
});
app.get('/logs', (req, res) => {
  console.log.bind(req);
  res.sendFile(path.resolve('./logs.html'));
});

app.post('/text-gen', async (req, res) => {
  if (!req.body.type) return res.status(400).send('Missing "type" POST variable in /text-gent endpoint.');
  if (!['arrive', 'interrogation', 'investigation'].includes(req.body.type)) return res.status(400).send('"type" POST variable in /text-gent should be: "arrive", "interrogation" "investigation".');

  const textGenParams = {
    type: req.body.type,
    authorStyle: req.body.authorStyle,
  };
  switch (req.body.type) {
    case 'arrive':
      if (!req.body.countryEs)     return res.status(400).send('Missing "countryEs" POST variable in /text-gent endpoint.');
      if (!req.body.cityEs)        return res.status(400).send('Missing "cityEs" POST variable in /text-gent endpoint.');
      // if (!req.body.detectiveName) return res.status(400).send('Missing "detectiveName" POST variable in /text-gent endpoint.');
      if (!req.body.thiefName)     return res.status(400).send('Missing "thiefName" POST variable in /text-gent endpoint.');
      if (!req.body.lootName)      return res.status(400).send('Missing "lootName" POST variable in /text-gent endpoint.');
      textGenParams.countryEs = req.body.countryEs;
      textGenParams.cityEs = req.body.cityEs;
      // textGenParams.detectiveName = req.body.detectiveName;
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
    case 'investigation':
      // if (!req.body.detectiveName) return res.status(400).send('Missing "detectiveName" POST variable in /text-gent endpoint.');
      // textGenParams.detectiveName = req.body.detectiveName;
      break;
  }
  myGameInstance.textGen(textGenParams)
    .then((text) => {
      res.send(text);
    })
    .catch((err) => {
      res.status(422).send(`Couldn\'t generate text: openAI response: ${err.response.status} ${$err.response.statusText}`);
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
      console.log(err);
      res.status(500).send({ imageUrl: '' });
    });
});

app.post('/tg', telegramWebhookController);

const port = process.env.PORT || 3333;
httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
