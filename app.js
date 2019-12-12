const config = require('config')

const apos = require('apostrophe')({
  shortName: config.get('shortName'),
  baseUrl: config.get('baseUrl'),
  modules: {
    'apostrophe-assets': {
      stylesheets: [{ name: 'site' }],
    },
    'apostrophe-db': {
      uri: config.get('mongo.uri'),
    },
    'apostrophe-express': {},
    'apostrophe-i18n': {
      autoReload: true,
      updateFiles: true,
      locales: config.get('languages.values').map(lang => lang.value),
      defaultLocale: config.get('languages.default'),
      localesDir: config.get('languages.localesDir'),
    },
    'apostrophe-pieces-export': {},
    'apostrophe-users': {
      groups: [
        {
          title: 'guest',
          permissions: [],
        },
        {
          title: 'admin',
          permissions: ['admin'],
        },
      ],
    },
    fixtures: {},
    translation: { export: true },
  },
})

module.exports = apos
