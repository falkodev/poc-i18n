// Main configuration file (based on node-config)
// See https://github.com/lorenwest/node-config
//
// Be sure to understand the configuration mechanism of node-config before applying
// changes in this file.
//
// If you need to setup a local configuration for your dev environnement you can
// create a ./local.js file with your own overrides. Note, that the local.js
// file does not needs to contains all the configuration keys: just the overrides.
const name = 'poc-i18n'
const port = process.env.PORT || 8080

module.exports = {
  shortName: name,

  baseUrl: process.env.BASE_URL || `http://localhost:${port}`,

  mongo: {
    uri: process.env.MONGODB || `mongodb://127.0.0.1:27017/${name}`,
  },

  languages: {
    default: 'en-US',
    values: [
      {
        label: 'German',
        value: 'de-DE',
      },
      {
        label: 'English',
        value: 'en-US',
      },
      {
        label: 'Spanish',
        value:  'es-ES',
      },
      {
        label: 'French',
        value: 'fr-FR',
      },
      {
        label: 'Japanese',
        value: 'jp-JP',
      },
      {
        label: 'Portuguese',
        value: 'pt-PT',
      },
      {
        label: 'Russian',
        value: 'ru-RU',
      },
      {
        label: 'Common Chinese',
        value: 'zh-CN',
      },
      {
        label: 'Taiwan Chinese',
        value: 'zh-TW',
      },
    ],
    localesDir: 'locales',
  },

  express: {
    port,
    session: {
      secret: 'bU3ecHawNSXcsAkgJ9wu2SqPAp',
    },
  },

  'apostrophe-users': {
    admin: {
      password: 'test',
    },
  },
}
