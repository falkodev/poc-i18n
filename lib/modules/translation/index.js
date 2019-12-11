const fs = require('fs-extra')
const config = require('config')
const languages = config.get('languages.values')

module.exports = {
  extend: 'apostrophe-pieces',
  name: 'translation',
  alias: 'translation',
  beforeConstruct(self, options) {
    options.addFields = [
      {
        name: 'lang',
        label: 'Language',
        type: 'select',
        choices: languages,
        required: true,
      },
      {
        name: 'key',
        label: 'Key',
        type: 'string',
        required: true,
      },
      {
        name: 'valueSingular',
        label: 'Singular Value',
        type: 'string',
        required: true,
      },
      {
        name: 'valuePlural',
        label: 'Plural Value',
        type: 'string',
      },
      ...(options.addFields || []),
    ]

    options.removeFields = ['slug', 'tags', 'published', 'title', ...(options.removeFields || [])]

    options.arrangeFields = [
      {
        name: 'basics',
        label: 'Basics',
        fields: ['lang', 'key', 'title', 'valueSingular', 'valuePlural'],
      },
      ...(options.arrangeFields || []),
    ]

    options.defaultColumns = [
      {
        name: 'lang',
        label: 'Language',
      },
      {
        name: 'key',
        label: 'Key',
      },
      {
        name: 'valueSingular',
        label: 'Singular Value',
      },
      {
        name: 'valuePlural',
        label: 'Plural Value',
      },
      ...(options.defaultColumns || []),
    ]

    options.addFilters = [
      {
        name: 'lang',
        label: 'Language',
        def: config.get('languages.default'),
      },
      ...(options.addFilters || []),
    ]
  },
  async construct(self, options) {
    self.beforeInsert = async (req, piece, options, callback) => {
      try {
        const keyAlreadyExists = await self
          .find(req, { key: piece.key, lang: piece.lang }, { permissions: false })
          .toObject()

        if (keyAlreadyExists) {
          throw new Error(`Key ${piece.key} already exists`)
        } else {
          piece.title = piece.key
          piece.published = true
          piece.slug = self.apos.utils.slugify(piece.key + '-' + piece.lang)

          return callback()
        }
      } catch (error) {
        return callback(error)
      }
    }

    self.afterSave = async (req, piece, options, callback) => {
      try {
        const time = new Date().getTime()
        req.data.global = req.data.global || await self.apos.global.findGlobal(req)
        await self.apos.global.update(req, { ...req.data.global, i18nGeneration: time })

        return callback()
      } catch (error) {
        self.apos.log.error(error.message, error.stack)
        return callback(error)
      }
    }
  },

  async afterConstruct(self) {
    await self.apos.docs.db
      .createIndex({ key: 1, lang: 1 }, { unique: true, partialFilterExpression: { type: self.name } })
      .catch(error => self.apos.log.error(error.message, error.stack))
  },
}
