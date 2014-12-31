'use strict';

module.exports = ZestCreator;

var createStatement = require('./createStatement'),
    addToStatement  = require('./addToStatement'),
    helper          = require('./helper'),
    _               = require('lodash'),
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

  this.index = 0;  // script index
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
      if (!! helper.ZestStatement.get(stmt.elementType)) {
        stmt.index = this._makeSpace(ele);
        stmt.enabled = true;
      }
      addToStatement(stmt, ele, this.statements);
    } else if (_.has(ele, 'after')) {
      stmt.index = ele.after + 1;
      stmt.enabled = true;
      this.shiftIndexAhead(stmt.index, 1);
      this.statements.splice(ele.after, 0, stmt);
      ++this.stmtIndex;
    } else if (!! stmt) {
      stmt.index = ++this.stmtIndex;
      stmt.enabled = true;
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
          lastStmt = _.last(parent.statements);
          if (!! lastStmt) {
            targetIndex = lastStmt.index + 1;
          } else {
            targetIndex = parent.index + 1;
          }
        }
        this.shiftIndexAhead(targetIndex, 1);
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
      parameters: {
        tokenStart: "{{",
        tokenEnd: "}}",
        tokens: {},
        elementType: 'ZestVariables'
      },
      statements: this.statements,
      authentication: [],
      index: this.index,
      enabled: true,
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
    console.log('getting ' + index);
    return helper.getStatement(this.statements, index);
  },

  getParent: function (index) {
    return helper.getParent(this.statements, index);
  },

  log: function (message, args) {
    if (this.debug) {
      console.log(message, args);
    }
  },

  /**
   * Delete a given statement from the list of statements.
   *
   * @param {object} ident
   *    An object with details to identify the stmt to be deleted.
   *    Example: {index: 4} or
   *    {parentIndex: 3, subStatementOf: 'ifStatements', index: 2}
   */
  deleteStatement: function (ident) {
    if (!! ident.parentIndex) {
      var parentStmt, list;
      parentStmt = this.getStatement(ident.parentIndex);
      if (!! ident.index) {
        list = parentStmt[ident.subStatementOf];
        list.splice(ident.index - 1, 1);
      } else {
        parentStmt[ident.subStatementOf] = {};
      }
    } else {
      var stmt, lastStmt, nextIndex, diff;
      stmt = this.getStatement(ident.index);
      if (stmt.elementType === 'ZestConditional') {
        // find the last stmt in the conditional stmt
        if (! _.isEmpty(stmt.elseStatements)) {
          lastStmt = _.last(stmt.elseStatements);
        } else if (! _.isEmpty(stmt.ifStatements)) {
          lastStmt = _.last(stmt.ifStatements);
        } else {
          lastStmt = stmt;
        }
        nextIndex = lastStmt.index + 1;
        diff = nextIndex - stmt.index;
      } else if (stmt.elementType.indexOf('ZestLoop') > -1) {
        // find the last stmt in the loop stmt
        if (! _.isEmpty(stmt.statements)) {
          lastStmt = _.last(stmt.statements);
        } else {
          lastStmt = stmt;
        }
        nextIndex = lastStmt.index + 1;
        diff = nextIndex - stmt.index;
      } else {
        nextIndex = ident.index + 1;
        diff = 1;
      }
      findAndDelete(this.statements, ident.index);
      this.shiftIndexBack(nextIndex, diff);
      this.stmtIndex -= diff;
    }
  },

  // Delete all the zest statements.
  deleteAll: function () {
    this.statements = [];
    this.stmtIndex = 0;
  },

  isSubStatement: function (index) {
    return helper.isSubStatement(this.statements, index);
  },

  /**
   * Move statements.
   *
   * @param {number} oldIndex - Index value of previous position.
   * @param {number} newIndex - Index value of the new position.
   */
  move: function (oldIndex, newIndex) {
    var oldStmt = this.getStatement(oldIndex);
    var newStmt = this.getStatement(newIndex);
    if (this.isSubStatement(oldStmt.index)) {
      console.log('old has parent');
      var parentOld = this.getParent(oldStmt.index);
      if (this.isSubStatement(newStmt.index)) {
        console.log('new has parent');
        var parentNew = this.getParent(newStmt.index);
        if (parentOld.index === parentNew.index) {
          console.log('parents match');
          parentOld.ifStatements.splice(newIndex - 1, 0,
                           parentOld.ifStatements.splice(oldIndex - 1, 1)[0]);
          console.log('done!');
          console.log(JSON.stringify(parentOld, undefined, 2));
        }
      }
    }
    //this.statements.splice(newIndex - 1, 0,
    //                       this.statements.splice(oldIndex - 1, 1)[0]);
    if (oldIndex < newIndex) {
      console.log('inside if');
      var stmt = this.getStatement(oldIndex);
      console.log(JSON.stringify(stmt));
      var nextStmt = this.nextStatement(stmt);
      stmt.index = newIndex;
      for (var i = oldIndex; i < newIndex; i++) {
        stmt = nextStmt;
        nextStmt = this.nextStatement(stmt);
        stmt.index = i;
      }
    } else if (oldIndex > newIndex) {
      var stmt = this.getStatement(oldIndex);
      var nextStmt = this.getStatement(newIndex);
      stmt.index = newIndex;
      for (var i = newIndex + 1; i <= oldIndex; i++) {
        stmt = nextStmt;
        nextStmt = this.nextStatement(stmt);
        stmt.index = i;
      }
    }
  },

  /**
   * Get next statement of the given statement.
   *
   * @param {object} stmt - a zest statement.
   *
   * @return {object} - next zest statement.
   */
  nextStatement: function (stmt) {
    return this.getStatement(stmt.index + 1);
  },

  /**
   * Shift the zest statements by decrementing index value.
   *
   * @param {number} from - shift from index number.
   * @param {number} diff - diff value for shifting.
   */
  shiftIndexBack: function (from, diff) {
    var postStmts = [];
    for (var i = from; i <= this.statementCount; i++) {
      postStmts.push(this.getStatement(i));
    }
    postStmts.forEach(function (item) {
      item.index -= diff;
    });
  },

  /**
   * Shift the zest stmts by incrementing index value.
   *
   * @param {number} from - shift from index number.
   * @param {number} diff - diff value for shifting.
   */
  shiftIndexAhead: function (from, diff) {
    var postStmts = [];
    for (var i = from; i <= this.statementCount; i++) {
      postStmts.push(this.getStatement(i));
    }
    postStmts.forEach(function (item) {
      item.index += diff;
    });
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

/**
 * Find and Delete the given index statement from the given list.
 *
 * @param {array} list - An array of statements.
 * @index {number} index - Index of the statement to be deleted.
 */
function findAndDelete (list, index) {
  _.remove(list, function (item) {
    if (! _.isEmpty(item.ifStatements)) {
      findAndDelete(item.ifStatements, index);
    }
    if (! _.isEmpty(item.elseStatements)) {
      findAndDelete(item.elseStatements, index);
    }
    if (! _.isEmpty(item.statements)) {
      findAndDelete(item.statements, index);
    }
    return item.index == index;
  });
}
