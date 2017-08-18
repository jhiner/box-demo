const uuidV4 = require('uuid/v4');
const request = require('request');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const logger = require('./logger');
const BoxConstants = require('./box-constants');

const issueAppUserToken = (publicKeyId, signingCert, boxClientId, boxId) => jwt.sign(
{
  iss: boxClientId,
  aud: BoxConstants.BASE_URL,
  jti: uuidV4(),
  sub: boxId,
  box_sub_type: BoxConstants.USER
},
signingCert,
{
  header: {
    typ: BoxConstants.DEFAULT_SETTINGS.JWT_TYPE,
    kid: publicKeyId
  },
  expiresIn: BoxConstants.DEFAULT_SETTINGS.JWT_EXPIRATION,
  noTimestamp: true,
  algorithm: BoxConstants.DEFAULT_SETTINGS.JWT_ALGORITHM
}
);

const getBoxId = user => Promise.resolve(user && user['http://box-platform/appuser/id']);

const getSigningCert = (signingCert, password) => {
  if (password && password.length) {
    return {
      key: signingCert,
      passphrase: password
    };
  }

  return signingCert;
};

function getEnterpriseToken(boxConfig) {
  let settings = utils.getSettings(boxConfig);
  const signingCert = getSigningCert(settings.boxAppSettings.appAuth.privateKey, settings.boxAppSettings.appAuth.passphrase);
  const token = jwt.sign(
  {
    iss: settings.boxAppSettings.clientID,
    aud: BoxConstants.BASE_URL,
    jti: uuidV4(),
    sub: settings.enterpriseID,
    box_sub_type: BoxConstants.ENTERPRISE,
    exp: Math.floor((Date.now() / 1000) + 30),
      iat: Math.floor((Date.now() / 1000) - 5) // for some reason it did not work if I set it to now
    },
    signingCert,
    {
      header: {
        typ: BoxConstants.DEFAULT_SETTINGS.JWT_TYPE,
        kid: settings.boxAppSettings.appAuth.publicKeyID
      },
      algorithm: BoxConstants.DEFAULT_SETTINGS.JWT_ALGORITHM
    }
    );

  const formData = {
    grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
    client_id: settings.boxAppSettings.clientID,
    client_secret: settings.boxAppSettings.clientSecret,
    assertion: token
  };

  logger.info('Getting Box Enterprise token...');
  logger.info('JWT: ' + token);
  return new Promise((resolve, reject) => {
    request.post({ url: BoxConstants.BASE_URL, form: formData, json: true }, (err, res, body) => {
      if (err) {
        logger.error('Box Error:', JSON.stringify(err, null, 2));
        return reject(err);
      }

      if (res.statusCode !== 200 || !body) {
        logger.error('Box Error:', JSON.stringify(res, null, 2));

        const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
        boxError.name = 'box_error';
        boxError.status = res.statusCode;
        return reject(boxError);
      }

      return resolve(body.access_token);
    });
  });
};

module.exports.provisionAppUser = (boxConfig, user) =>
getEnterpriseToken(boxConfig)
.then((enterpriseToken) => {
  const options = {
    headers: {
      Authorization: `Bearer ${enterpriseToken}`
    },
    url: BoxConstants.APP_USERS_URL,
    json: {
      name: user.email,
      is_platform_access_only: true
    }
  };


  logger.info('Provisioning Box App User...');
  return new Promise((resolve, reject) => {
    request.post(options, (err, res, body) => {
      if (err) {
        logger.error('Box Error:', JSON.stringify(err, null, 2));
        return reject(err);
      }

      if (res.statusCode >= 300 || !body) {
        logger.error('Box Error:', JSON.stringify(res, null, 2));

        const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
        boxError.name = 'box_error';
        boxError.status = res.statusCode;
        return reject(boxError);
      }

      logger.info("Provisioned app user");
      logger.info(JSON.stringify(res.body));
      return resolve(res.body);
    });
  });
});

module.exports.getAppUserToken = (boxConfig, user) => {
  let settings = utils.getSettings(boxConfig);
  return this.provisionAppUser(boxConfig, user)
  .then(response => {
    user.boxId = response.id;
    return Promise.resolve(user);
  }) 
  .then(user => {
    const signingCert = getSigningCert(settings.boxAppSettings.appAuth.privateKey, settings.boxAppSettings.appAuth.passphrase);
    const appUserToken = issueAppUserToken(settings.boxAppSettings.appAuth.publicKeyID, signingCert, settings.boxAppSettings.clientID, user.boxId);
    const formData = {
      grant_type: BoxConstants.DEFAULT_SETTINGS.JWT_GRANT_TYPE,
      client_id: settings.boxAppSettings.clientID,
      client_secret: settings.boxAppSettings.clientSecret,
      assertion: appUserToken
    };

    return new Promise((resolve, reject) => {
      request.post({ url: BoxConstants.BASE_URL, form: formData, json: true }, (err, res, body) => {
        if (err) {
          logger.error('Box Error:', JSON.stringify(err, null, 2));
          return reject(err);
        }

        if (res.statusCode !== 200 || !body) {
          logger.error('Box Error:', JSON.stringify(res, null, 2));

          const boxError = new Error(`${(body && body.error_description) || res.text || res.statusCode}`);
          boxError.name = 'box_error';
          boxError.status = res.statusCode;
          return reject(boxError);
        }

        const boxToken = body;
        return resolve(boxToken);
      });
    });
  });
}