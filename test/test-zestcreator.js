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
}

var sampleRes = {
  url: 'http://bar.com',
  body: 'qwerty',
  statusCode: 200,
  responseTimeInMs: 222,
  elementType: 'ZestResponse',
  subStatementOf: 'response'
}

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
}

var sampleActionPrint = {
  message: 'Pass',
  elementType: 'ZestActionPrint'
};

var sampleActionFail = {
  message: 'Fail',
  priority: 'HIGH',
  elementType: 'ZestActionFail'
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

    it('should create assertion statement', function () {
      zc.addStatement({
        rootExpression: {
          code: 200,
          not: false,
          elementType: 'ZestExpressionStatusCode'
        },
        elementType: 'ZestAssertion',
        subStatementOf: 'assertions',
        parentIndex: zc.statementCount
      });
      var stmt = zc.getStatement(zc.statementCount);
      stmt.assertions[0].rootExpression.should.have.properties({
        code: 200,
        not: false,
        elementType: 'ZestExpressionStatusCode'
      });
      stmt.assertions[0].should.have.property('elementType', 'ZestAssertion');
      zc.statementCount.should.be.exactly(3);
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

      var expectedIf = {
        message: 'Pass',
        elementType: 'ZestActionPrint',
        index: 5
      };
      var expectedElse = {
        message: 'Fail',
        priority: 'HIGH',
        elementType: 'ZestActionFail',
        index: 6
      };
      stmt = zc.getStatement(index);
      stmt.ifStatements[0].should.have.properties(expectedIf);
      stmt.elseStatements[0].should.have.properties(expectedElse);
      zc.statementCount.should.be.exactly(6);
    });
  });
});
