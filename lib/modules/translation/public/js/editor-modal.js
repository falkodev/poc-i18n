apos.define('translation-editor-modal', {
  extend: 'apostrophe-pieces-editor-modal',
  construct: function(self, options) {
    var superBeforeShow = self.beforeShow
    self.beforeShow = function(callback) {
      // the "key" field must be disabled to block modifications
      var $name = apos.schemas.findField(self.$el, 'key')
      $name.attr('disabled', true)
      return superBeforeShow(callback)
    }
  },
})
