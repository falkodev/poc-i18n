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
    self.beforeList = async (req, filters, callback) => {
      try {
        for (const lang of languages) {
          const file = await fs.readJSON(config.get('languages.localesDir') + '/' + lang.value + '.json')

          for (const [key, value] of Object.entries(file)) {
            const pieceInDb = await self.find(req, { key, lang: lang.value }).toObject()
            if (!pieceInDb) {
              const piece = {
                key: key,
                title: key,
                type: self.name,
                published: true,
                lang: lang.value,
                valueSingular: value,
              }
              if (typeof value === 'object') {
                Object.assign(piece, {
                  valueSingular: value.one || '',
                  valuePlural: value.other || '',
                })
              }
              await self.insert(req, piece)
            }
          }
        }

        return callback()
      } catch (error) {
        self.apos.log.error(error.message, error.stack)
        return callback(error)
      }
    }

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
        const file = config.get('languages.localesDir') + '/' + piece.lang + '.json'
        await fs.ensureFile(file)

        const pieces = await self
          .find(req, { published: true, lang: piece.lang }, { key: 1, valueSingular: 1, valuePlural: 1 })
          .toArray()

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
