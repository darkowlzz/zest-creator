'use strict';

module.exports = ZestCreator;

var createStatement = require('./createStatement'),
    addToStatement  = require('./addToStatement'),
    helper          = require('./helper'),
    _               = require('underscore'),
    JQL             = require('jsonquerylanguage'),
    jql             = new JQL(),
    fs              = require('fs');

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
  opts = opts || {};
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
    if (_.has(ele, 'subStatementOf')) {
      if ((stmt.elementType == 'ZestActionPrint') || 
          (stmt.elementType == 'ZestActionFail') ||
          (stmt.elementType == 'ZestActionSleep')){
        stmt.index = this._makeSpace(ele);
      }
      addToStatement(stmt, ele, this.statements);
    } else if (!! stmt) {
      stmt.index = ++this.stmtIndex;
      this.statements.push(stmt);
    }
  },

  /**
   * Create space for new element by moving the statements down (increment
   * index values).
   * Algo: Check if the given element is a sub stmt or a parent stmt. If
   * substmt, compare the parent's index and total number of stmts. On equality
   * increment the stmtIndex and return it as the target position. On
   * inequality, check if parent the parent is 'ZestConditional' or
   * 'ZestLoop*' and rearrange the index number of substmts as per the type of
   * parent. If an space is to be created anywhere other than the end, move the
   * following stmts my incrementing the index values of those stmts.
   * Any improvement in this description is encouraged.
   *
   * @param (object) ele
   *    statement to be added to zest with raw details about
   *    its position.
   *
   * @return (number) targetIndex
   *    index value of the target position.
   */
  _makeSpace: function (ele) {
    if (_.has(ele, 'subStatementOf')) {
      if (ele.parentIndex === this.statementCount) {
        return ++this.stmtIndex;
      } else if (ele.parentIndex < this.statementCount) {
        var parent = this.getStatement(ele.parentIndex);
        var lastStmt, targetIndex;

        if (parent.elementType == 'ZestConditional') {
          if (ele.subStatementOf == 'ifStatements') {
            lastStmt = _.last(parent.ifStatements);
            if (!! lastStmt) {
              targetIndex = lastStmt.index + 1;
            } else {
              targetIndex = parent.index + 1;
            }
          } else if (ele.subStatementOf == 'elseStatements') {
            lastStmt = _.last(parent.elseStatements);
            if (!! lastStmt) {
              targetIndex = lastStmt.index + 1;
            } else {
              if (! _.isEmpty(parent.ifStatements)) {
                targetIndex = _.last(parent.ifStatements).index + 1;
              } else {
                targetIndex = parent.index + 1;
              }
            }
          }
        } else if (parent.elementType.indexOf('ZestLoop') > -1) {
          // to be implemented later
        }
        var nextCounter = 0;
        var postStmts = [];
        // collect all the following stmts and increment index value
        for (var i = targetIndex; i <= this.statementCount; i++) {
          postStmts.push(this.getStatement(i));
        }
        postStmts.forEach(function (item) {
          item.index++;
        });
        ++this.stmtIndex;
        return targetIndex;
      }
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
    return helper.getStatement(index, this.statements);
  },

  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  },

  /**
   * Save zest to a file.
   *
   * @param {string} [optional] filename - Name of the file.
   */
  saveToFile: function (filename) {
    filename = filename || 'newzest.zst';
    var z     = this.getZest(),
        text  = JSON.stringify(z, undefined, 2),
        regex = new RegExp('.zst$');
    filename = regex.test(filename) ? filename : (filename + '.zst');
    fs.writeFileSync(filename, text);
  }
};
