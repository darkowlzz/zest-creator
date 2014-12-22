'use strict';

var JQL  = require('jsonquerylanguage'),
    jql  = new JQL(),
    Enum = require('enum');

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

var ZestStatement = new Enum([
  'ZestComment', 'ZestRequest', 'ZestConditional', 'ZestActionPrint',
  'ZestActionFail', 'ZestActionSleep', 'ZestAssignString',
  'ZestAssignRandomInteger', 'ZestAssignFieldValue', 'ZestAssignReplace',
  'ZestAssignStringDelimiters', 'ZestAssignRegexDelimiters', 'ZestLoopString'
]);
exports.ZestStatement = ZestStatement;
