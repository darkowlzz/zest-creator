'use strict';

var ZestCreator = require('../'),
    should = require('should'),
    _      = require('underscore');

var opts = {
  title: 'my zest',
  description: 'a little zest script',
  client: 'test client',
  author: 'mocha'
};

var sampleReq = {
  url: 'http://foo.com',
  method: 'GET',
  elementType: 'ZestRequest'
};

var sampleRes = {
  url: 'http://bar.com',
  body: 'qwerty',
  statusCode: 200,
  responseTimeInMs: 222,
  elementType: 'ZestResponse',
  subStatementOf: 'response'
};

var sampleExpressionStatusCode = {
  code: 200,
  not: false,
  elementType: 'ZestExpressionStatusCode'
};

var sampleExpressionLength = {
  length: 10,
  approx: 1,
  variableName: 'request.url',
  elementType: 'ZestExpressionLength'
};

var sampleExpressionRegex = {
  regex: '/^foo/',
  variableName: 'response.body',
  elementType: 'ZestExpressionRegex'
};

var sampleCondition = {
  rootExpression: {
    value: 'GET',
    variableName: 'request.method',
    caseExact: false,
    not: false,
    elementType: 'ZestExpressionEquals'
  },
  ifStatements: [],
  elseStatements: [],
  elementType: 'ZestConditional'
};

var sampleActionPrint = {
  message: 'Pass',
  elementType: 'ZestActionPrint'
};

var sampleActionFail = {
  message: 'Fail',
  priority: 'HIGH',
  elementType: 'ZestActionFail'
};

var sampleActionSleep = {
  milliseconds: 2,
  elementType: 'ZestActionSleep'
};


describe('create a ZestCreator object', function () {
  it('should create an object with default config', function () {
    var zc = new ZestCreator();
    zc.config.should.have.properties('title', 'description', 'client',
                                     'author');
  });

  it('should create an object with the given config', function () {
    var zc = new ZestCreator(opts);
    zc.config.should.have.properties({
      title: 'my zest',
      description: 'a little zest script',
      client: 'test client',
      author: 'mocha'
    });
  });
});

describe('ZC basic testing', function () {
  var zc = new ZestCreator(opts);

  describe('getZest', function () {
    it('should return proper zest object', function () {
      var r = zc.getZest();
      r.should.have.properties({
        about: 'About text',
        zestVersion: '1.0',
        title: 'my zest',
        description: 'a little zest script',
        author: 'mocha',
        generatedBy: 'test client',
        index: 1,
        elementType: 'ZestScript'
      });
      zc.statementCount.should.be.exactly(0);
    });
  });

  describe('create zest statements', function () {
    it('should create 2 zest comment statements', function () {
      zc.addStatement({ comment: 'A comment', elementType: 'ZestComment' });
      zc.addStatement({ comment: 'another one', elementType: 'ZestComment'});
      var stmt1 = zc.getStatement(1);
      stmt1.should.have.properties({
        comment: 'A comment',
        index: 1,
        elementType: 'ZestComment'
      });
      var stmt2 = zc.getStatement(2);
      stmt2.should.have.properties({
        comment: 'another one',
        index: 2,
        elementType: 'ZestComment'
      });
      zc.statementCount.should.be.exactly(2);
    });

    it('should create request statement', function () {
      zc.addStatement(sampleReq);
      var resObj = _.clone(sampleRes);
      resObj.parentIndex = zc.statementCount; 
      zc.addStatement(resObj);

      var stmt = zc.getStatement(zc.statementCount);
      stmt.should.have.properties({
        url: 'http://foo.com',
        data: 'unknown',
        method: 'GET',
        headers: 'unknown',
        index: 3,
        elementType: 'ZestRequest'
      });
      stmt.response.should.have.properties({
        url: 'http://bar.com',
        body: 'qwerty',
        statusCode: 200,
        responseTimeInMs: 222,
        elementType: 'ZestResponse'
      });
      zc.statementCount.should.be.exactly(3);
    });

    it('should create ExpressionStatusCode assertion statement', function () {
      var expStatCode = _.clone(sampleExpressionStatusCode);
      expStatCode.subStatementOf = 'assertions';
      expStatCode.parentIndex = zc.statementCount;
      zc.addStatement(expStatCode);
      var stmt = zc.getStatement(zc.statementCount);
      stmt.assertions[0].rootExpression.should.have.properties({
        code: 200,
        not: false,
        elementType: 'ZestExpressionStatusCode'
      });
      stmt.assertions[0].should.have.property('elementType', 'ZestAssertion');
      zc.statementCount.should.be.exactly(3);
    });

    it('should create ExpressionLength assertion statement', function () {
      var expLength = _.clone(sampleExpressionLength);
      expLength.subStatementOf = 'assertions';
      expLength.parentIndex = zc.statementCount;
      zc.addStatement(expLength);
      var stmt = zc.getStatement(zc.statementCount);
      stmt.assertions[1].rootExpression.should.have.properties({
        length: 10,
        approx: 1,
        variableName: 'request.url',
        not: false,
        elementType: 'ZestExpressionLength'
      });
    });

    it('should create ExpressionRegex assertion statement', function () {
      var expRegex = _.clone(sampleExpressionRegex);
      expRegex.subStatementOf = 'assertions';
      expRegex.parentIndex = zc.statementCount;
      zc.addStatement(expRegex);
      var stmt = zc.getStatement(zc.statementCount);
      stmt.assertions[2].rootExpression.should.have.properties({
        regex: '/^foo/',
        variableName: 'response.body',
        caseExact: false,
        not: false,
        elementType: 'ZestExpressionRegex'
      });
    });

    it('should create conditional statement', function () {
      zc.addStatement(sampleCondition);
      var stmt = zc.getStatement(zc.statementCount);
      stmt.should.have.properties(sampleCondition);

      var actionPrint = _.clone(sampleActionPrint);
      actionPrint.subStatementOf = 'ifStatements';
      var index = zc.statementCount;
      actionPrint.parentIndex = index;
      zc.addStatement(actionPrint);

      var actionFail = _.clone(sampleActionFail);
      actionFail.subStatementOf = 'elseStatements';
      actionFail.parentIndex = index;
      zc.addStatement(actionFail);

      var actionSleep = _.clone(sampleActionSleep);
      actionSleep.subStatementOf = 'ifStatements';
      actionSleep.parentIndex = index;
      zc.addStatement(actionSleep);

      var expectedIf = {
        message: 'Pass',
        elementType: 'ZestActionPrint',
        index: 5
      };
      var expectedIf2 = {
        milliseconds: 2,
        elementType: 'ZestActionSleep',
        index: 6
      };
      var expectedElse = {
        message: 'Fail',
        priority: 'HIGH',
        elementType: 'ZestActionFail',
        index: 7
      };

      stmt = zc.getStatement(5);
      stmt.should.have.properties(expectedIf);
      stmt = zc.getStatement(6);
      stmt.should.have.properties(expectedIf2);
      stmt = zc.getStatement(7);
      stmt.should.have.properties(expectedElse);
      zc.statementCount.should.be.exactly(7);

      // Add a statement to the end and a sub stmt to the conditional
      zc.addStatement({ comment: 'again', elementType: 'ZestComment' });
      actionSleep = _.clone(sampleActionSleep);
      actionSleep.subStatementOf = 'ifStatements';
      actionSleep.milliseconds = 5;
      actionSleep.parentIndex = 4;
      zc.addStatement(actionSleep);

      expectedIf = {
        milliseconds: 5,
        elementType: 'ZestActionSleep',
        index: 7
      };

      stmt = zc.getStatement(7);
      stmt.should.have.properties(expectedIf);
      zc.statementCount.should.be.exactly(9);
    });

    it('should create status code conditional stmt', function () {
      zc.addStatement(sampleExpressionStatusCode);
      var stmt = zc.getStatement(10);
      stmt.rootExpression.should.have.properties({
        code: 200,
        not: false,
        elementType: 'ZestExpressionStatusCode'
      });
      stmt.should.have.properties({
        elementType: 'ZestConditional',
        index: 10
      });
      zc.statementCount.should.be.exactly(10);
    });

    it('should create expression length conditional stmt', function () {
      zc.addStatement(sampleExpressionLength);
      var stmt = zc.getStatement(11);
      stmt.rootExpression.should.have.properties({
        length: 10,
        approx: 1,
        variableName: 'request.url',
        elementType: 'ZestExpressionLength',
        not: false
      });
      stmt.should.have.properties({
        elementType: 'ZestConditional',
        index: 11
      });
      zc.statementCount.should.be.exactly(11);
    });

    it('should create regex conditional stmt', function () {
      zc.addStatement(sampleExpressionRegex);
      var stmt = zc.getStatement(12);
      stmt.rootExpression.should.have.properties({
        regex: '/^foo/',
        variableName: 'response.body',
        elementType: 'ZestExpressionRegex',
        caseExact: false,
        not: false
      });
      stmt.should.have.properties({
        elementType: 'ZestConditional',
        index: 12
      });
      zc.statementCount.should.be.exactly(12);
      console.log(JSON.stringify(zc.getZest(), undefined, 2));
    });
  });
});
