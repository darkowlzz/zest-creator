module.exports = addToStatement;

var _ = require('underscore');


/**
 * Add a given statement to a parent statement.
 *
 * @param {object} stmt - Statement to be added.
 * @param {object} ele -  Parent's statement index.
 * @param {array} stmts - An array of statements present in ZC.
 */
function addToStatement (stmt, ele, stmts) {
  var parent = stmts[ele.parentIndex - 1];

  switch (stmt.elementType) {
    case 'ZestResponse':
      parent[ele.subStatementOf] = stmt;
      break;

    case 'ZestAssertion':
      if (! _.has(parent, ele.subStatementOf)) {
        parent[ele.subStatementOf] = [];
      }
      parent[ele.subStatementOf].push(stmt);
      break;

    case 'ZestActionPrint':
      if (! _.has(parent, ele.subStatementOf)) {
        parent[ele.subStatementOf] = [];
      }
      parent[ele.subStatementOf].push(stmt);
      break;

    case 'ZestActionFail':
      if (! _.has(parent, ele.subStatementOf)) {
        parent[ele.subStatementOf] = [];
      }
      parent[ele.subStatementOf].push(stmt);
      break;

    default:

  }
}
