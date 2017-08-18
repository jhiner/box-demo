const uuidV4 = require('uuid/v4');
const path = require('path');
const fs = require('fs');
const box = require('./lib/box');

// load our box config file
fs.readFile(path.join(__dirname, './box.json'), 'utf8', (err, boxConfig) => {
  if (err) console.error(err);
  let config = JSON.parse(boxConfig);

  // if successful, proceed to token generation
  let sampleUser = {
    user_id: uuidV4(),
    name: 'John Smith',
    email: 'justin@hinerman.net'
  };

  console.log('----------------------------');
  
  box.getAppUserToken(config, sampleUser)
  .then(token => {
    console.log('----------------------------');
    console.log('');
    console.log('Here is your Box token:');
    console.log(token);  
  })
  .catch(err => {
    console.log(err);
  });
});
