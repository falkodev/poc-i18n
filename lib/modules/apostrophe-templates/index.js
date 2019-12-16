const { inspect } = require('util')

module.exports = {
  construct: function(self, options) {
    const superI18n = self.i18n

    self.i18n = function(req, operation, key) {
      self.apos.translation.find(req, { key, lang: req.locale }).toObject((err, pieceInDb) => {
        if (err) {
          console.log('Error while finding translation piece', err.message)
        }

        if (!pieceInDb) {
          const piece = {
            key: key,
            title: key,
            published: true,
            lang: req.locale,
            valueSingular: key,
            type: 'translation',
          }

          if (operation === '__n') {
            Object.assign(piece, { valuePlural: key })
          }

          self.apos.translation.insert(req, piece, (err, pieceAdded) => {
            if (err) {
              console.log('Error while inserting translation piece', inspect(err.message, { colors: true }))
            } else {
              console.log(
                'New translation piece added',
                inspect(pieceAdded.key, { colors: true }),
                'for',
                inspect(req.locale, { colors: true }),
              )
            }
          })
        }
      })

      return superI18n.apply(null, Array.prototype.slice.call(arguments))
    }
  },
}
