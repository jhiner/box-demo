module.exports.issueAppUserToken = (publicKeyId, signingCert, boxClientId, boxId) => jwt.sign(
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

module.exports.getBoxId = user => Promise.resolve(user && user['http://box-platform/appuser/id']);

module.exports.getSigningCert = (signingCert, password) => {
  if (password && password.length) {
    return {
      key: signingCert,
      passphrase: password
    };
  }

  return signingCert;
};

module.exports.getSettings = function(boxConfig) {
  const boxSettings = boxConfig;
  return {
    boxAppSettings: {
      clientID: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.clientID,
      clientSecret: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.clientSecret,
      appAuth: {
        publicKeyID: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.publicKeyID,
        privateKey: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.privateKey,
        passphrase: boxSettings && boxSettings.boxAppSettings && boxSettings.boxAppSettings.appAuth && boxSettings.boxAppSettings.appAuth.passphrase
      }
    },
    enterpriseID: boxSettings.enterpriseID
  }
};