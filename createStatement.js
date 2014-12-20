'use strict';

module.exports = createStatement;

var _ = require('underscore');


/**
 * Create a zest statement from the given element properties.
 *
 * @param {object} ele - Object with element properties.
 *
 * @return {object} stmt - A zest statement.
 */
function createStatement (ele) {
  var stmt, properties;

  switch (ele.elementType) {
    case 'ZestComment':
      properties = _.pick(ele, 'comment', 'elementType');
      stmt = _.defaults(properties, {
        comment: 'None',
        index: ''
      });
      break;

    case 'ZestRequest':
      properties = _.pick(ele,
                          'url', 'data', 'method', 'headers',
                          'followRedirect', 'elementType');
      stmt = _.defaults(properties, {
        url: 'unknown',
        data: 'unknown',
        method: 'unknown',
        headers: 'unknown',
        response: {},
        assertions: [],
        followRedirect: false,
        index: ''
      });
      break;

    case 'ZestResponse':
      properties = _.pick(ele,
                          'url', 'headers', 'body', 'statusCode',
                          'responseTimeInMs', 'elementType');
      stmt = _.defaults(properties, {
        url: 'unknown',
        headers: 'unknown',
        body: 'unknown',
        statusCode: 'unknown',
        responseTimeInMs: 'unknown',
        elementType: ele.elementType
      });
      break;

    case 'ZestAssertion':
      properties = _.pick(ele, 'rootExpression', 'elementType');
      stmt = properties;
      break;

    case 'ZestExpressionStatusCode':
      properties = _.pick(ele, 'code', 'not', 'elementType');
      stmt = _.defaults(properties, {
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestExpressionLength':
      properties = _.pick(ele,
                          'length', 'approx', 'variableName', 'not',
                          'elementType');
      stmt = _.defaults(properties, {
        approx: 1,
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestExpressionRegex':
      properties = _.pick(ele,
                          'regex', 'variableName', 'caseExact', 'not',
                          'elementType');
      stmt = _.defaults(properties, {
        caseExact: false,
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestExpressionURL':
      properties = _.pick(ele,
                          'includeRegexes', 'excludeRegexes', 'not',
                          'elementType');
      stmt = _.defaults(properties, {
        includeRegexes: [],
        excludeRegexes: [],
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestExpressionEquals':
      properties = _.pick(ele,
                          'value', 'variableName', 'caseExact', 'not',
                          'elementType');
      stmt = _.defaults(properties, {
        value: '',
        caseExact: false,
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestExpressionResponseTime':
      properties = _.pick(ele,
                          'greaterThan', 'timeInMs', 'not', 'elementType');
      stmt = _.defaults(properties, {
        greaterThan: true,
        not: false
      });
      stmt = createExpression(stmt, ele);
      break;

    case 'ZestConditional':
      properties = _.pick(ele,
                          'rootExpression', 'ifStatements', 'elseStatements',
                          'elementType');
      stmt = _.defaults(properties, {
        ifStatements: [],
        elseStatements: [],
        index: ''
      });
      break;

    case 'ZestActionPrint':
      properties = _.pick(ele, 'message', 'elementType');
      stmt = properties;
      break;

    case 'ZestActionFail':
      properties = _.pick(ele, 'message', 'priority', 'elementType');
      stmt = properties;
      break;

    case 'ZestActionSleep':
      properties = _.pick(ele, 'milliseconds', 'elementType');
      stmt = properties;
      break;

    case 'ZestAssignString':
      properties = _.pick(ele,
                          'string', 'variableName', 'elementType');
      stmt = properties;
      break;

    case 'ZestAssignRandomInteger':
      properties = _.pick(ele,
                          'minInt', 'maxInt', 'variableName', 'elementType');
      stmt = _.defaults(properties, {
        minInt: 0,
        maxInt: 10000
      });
      break;

    default:
      stmt = null;
  }

  return stmt;
}

/**
 * Create expressions for assertions or conditionals.
 *
 * @param {object} stmt - rootExpression object.
 * @param {object} ele - raw data of the expression to be created.
 *
 * @return {object} stmt - an statement with expression within it.
 */
function createExpression (stmt, ele) {
  if (ele.subStatementOf === 'assertions') {
    var assertion = {
      rootExpression: stmt,
      elementType: 'ZestAssertion'
    };
    stmt = createStatement(assertion);
  } else {
    var condition = {
      rootExpression: stmt,
      elementType: 'ZestConditional'
    };
    stmt = createStatement(condition);
  }
  return stmt;
};
