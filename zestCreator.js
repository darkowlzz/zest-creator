module.exports = ZestCreator;

var createStatement = require('./createStatement'),
    addToStatement  = require('./addToStatement'),
    _               = require('underscore');

var DEBUG = true;
var ZEST_VERSION = "1.0";


/**
 * ZestCreator class.
 *
 * @param {object} opts
 *    A configuration object to set zest creator properties like
 *    `about`, `title`, `description`, `client`, `author`, `zestVersion`
 *    and `debug`.
 */
function ZestCreator (opts) {
  var opts = opts || {};
  this.config = _.defaults(opts, {
    about: 'About text',
    title: 'Unnamed Zest script',
    description: 'No description',
    client: 'Zest-Creator',
    author: 'anon',
    zestVersion: ZEST_VERSION,
    debug: DEBUG
  });

  this.index = 1;  // script index
  this.stmtIndex = 0;  // statement index
  this.statements = [];
}

ZestCreator.prototype = {

  /**
   * Add a new statement to zest `statements`
   *
   * @param {object} ele
   *    An object consisting of all the properties of any type of zest
   *    statements.
   */
  addStatement: function (ele) {
    var stmt = createStatement(ele);
    if (_.has(ele, 'subStatement')) {
      addToStatement(stmt, ele.parentIndex, this.statements);
    } else if (!! stmt) {
      stmt.index = ++this.stmtIndex;
      this.statements.push(stmt);
    }
  },

  // Returns a proper zest object.
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

  // Returns the number of statements in the zest object.
  get statementCount () {
    return this.stmtIndex;
  },

  /**
   * Returns statement with the given index.
   *
   * @param {number} index - Index of requested statement.
   *
   * @return {object} - requested statement object.
   */
  getStatement: function (index) {
    return this.statements[index - 1];
  },

  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  }
};
