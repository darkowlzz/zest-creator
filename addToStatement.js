module.exports = addToStatement;

var _ = require('underscore');


/**
 * Add a given statement to a parent statement.
 *
 * @param {object} stmt - Statement to be added.
 * @param {number} parentIndex -  Parent's statement index.
 * @param {Array} stmts - An array of statements present in ZC.
 */
function addToStatement (stmt, parentIndex, stmts) {
  var parent = stmts[parentIndex - 1];
  switch (stmt.elementType) {
    case 'ZestResponse':
      parent.response = stmt;
      break;

    case 'ZestAssertion':
      if (! _.has(parent, 'assertions')) {
        parent.assertions = [];
      }
      parent.assertions.push(stmt);
      break;

    default:

  }
}
