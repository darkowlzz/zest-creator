module.exports = ZestCreator;

var _ = require('underscore');

var DEBUG = true;

function ZestCreator (opts) {
  this.config = _.extend({
    title: 'Unnamed Zest script',
    description: 'No description',
    client: 'Zest-Creator',
    author: 'anon',
    debug: DEBUG
  }, opts);
}

ZestCreator.prototype = {
  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  }
};
