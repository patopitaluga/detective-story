import * as fs from 'fs';
// dotenv alternative
if (fs.existsSync('./.env')) {
  fs.readFileSync('./.env', 'utf8').split(/[\r\n]+/).forEach((_eachEnv) => {
    const parts = _eachEnv.split('=');
    process.env[parts[0]] = parts[1];
  });
}

if (!process.env.TELEGRAM_TOKEN) throw new Error('Missing env variable TELEGRAM_TOKEN.');

const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook?url=https://detective-story.herokuapp.com/tg`;
console.log(url);
fetch(url)
  .then((rawResponse) => rawResponse.json())
  .then((_) => {
    console.log(_);
  })
  .catch((_) => {
    console.log(_);
  });*/
