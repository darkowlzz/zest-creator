'use strict';

var JQL = require('jsonquerylanguage'),
    jql = new JQL();

function getStatement (index, stmts) {
  var result = jql.searchAndGetValues(stmts,
                                      '~[?(@.index == ' + index + ' )]');
  if (result == []) {
    return null;
  } else {
    return result[0];
  }
}
exports.getStatement = getStatement;
