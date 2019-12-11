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
        req.data.global = req.data.global || await self.apos.global.findGlobal(req)
        // update global doc with random number to compare it with the next req
        // see expressMiddleware in this file
        await self.apos.global.update(req, { ...req.data.global, i18nGeneration: new Date().getTime() })

        return callback()
      } catch (error) {
        self.apos.log.error(error.message, error.stack)
        return callback(error)
      }
    }

    self.expressMiddleware = async (req, res, next) => {
      // compare i18n number in req and in global
      // if they don't match, it means a language had a translation piece edited
      // so need to reload this i18n language file
      if (parseInt(req.cookies.i18nGeneration) !== req.data.global.i18nGeneration) {
        const file = config.get('languages.localesDir') + '/' + req.locale + '.json'
        await fs.ensureFile(file)

        const pieces = await self.find(req, { published: true, lang: req.locale }, { key: 1, valueSingular: 1, valuePlural: 1 }).toArray()

        const translations = translatePieces(pieces)
        await fs.writeJson(file, translations, { spaces: 2 })

        function translatePieces(pieces) {
          return pieces.reduce((acc, cur) => {
            if (cur.valuePlural) {
              acc[cur.key] = {
                one: cur.valueSingular,
                other: cur.valuePlural,
              }
            } else {
              acc[cur.key] = cur.valueSingular
            }
            return acc
          }, {})
        }
      }
      res.cookie('i18nGeneration', req.data.global.i18nGeneration)
      next()
    }
  },

  async afterConstruct(self) {
    await self.apos.docs.db
      .createIndex({ key: 1, lang: 1 }, { unique: true, partialFilterExpression: { type: self.name } })
      .catch(error => self.apos.log.error(error.message, error.stack))
  },
}
