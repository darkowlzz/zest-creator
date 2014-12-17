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

    default:
      stmt = null;
  }

  return stmt;
}
