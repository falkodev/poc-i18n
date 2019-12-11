module.exports = {
  construct: function(self, options) {
    const superI18n = self.i18n

    self.i18n = function(req, operation, key) {
      self.apos.translation.find(req, { key, lang: req.locale }).toObject((err, pieceInDb) => {
        if (err) { console.log('error while finding translation piece', err.message) }

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
            if (err) { console.log('error while inserting translation piece', err.message) }
            else { console.log(`new translation piece added ${pieceAdded.key} for ${req.locale}`) }
          })
        }
      })

      return superI18n.apply(null, Array.prototype.slice.call(arguments));
    };
  }
}
