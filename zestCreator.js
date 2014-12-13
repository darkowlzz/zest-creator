module.exports = ZestCreator;

var _ = require('underscore');

var DEBUG = true;
var ZEST_VERSION = "1.0";

function ZestCreator (opts) {
  this.config = _.extend({
    about: 'About text',
    title: 'Unnamed Zest script',
    description: 'No description',
    client: 'Zest-Creator',
    author: 'anon',
    zestVersion: ZEST_VERSION,
    debug: DEBUG
  }, opts);

  this.index = 1;  // script index
  this.stmtIndex = 0;  // statement index
  this.statements = [];
}

ZestCreator.prototype = {

  // Add a new statement to `statements`
  addStatement: function (data) {
    var stmt;

    switch (data.elementType) {
      case 'ZestComment':
        stmt = _.extend({
          comment: 'None',
          index: ++this.stmtIndex,
          elementType: data.elementType
        }, data);
        break;

      case 'ZestRequest':
        stmt = _.extend({
          url: 'unknown',
          data: 'unknown',
          method: 'unknown',
          headers: 'unknown',
          response: {
            url: 'unknown',
            headers: 'unknown',
            body: 'unknown',
            statusCode: 'unknown',
            responseTimeInMs: 'unknown',
            elementType: 'ZestResponse'
          },
          followRedirect: false,
          index: ++this.stmtIndex,
          elementType: data.elementType
        }, data);
        break;

      default:
        stmt = null;
    }
    if (!! stmt)
      this.statements.push(stmt);
  },

  // Return a proper zest object
  getZest: function () {
    return {
      about: this.config.about,
      zestVersion: this.config.zestVersion,
      title: this.config.title,
      description: this.config.description,
      author: this.config.author,
      generatedBy: this.config.client,
      statements: this.statements,
      authentication: [],
      index: this.index,
      elementType: 'ZestScript'
    };
  },

  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  }
};
