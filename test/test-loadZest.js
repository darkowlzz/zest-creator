'use strict';

var sampleZest  = require('../testData/sampleDataSet').sampleZest,
    should      = require('should'),
    ZestCreator = require('../');

var opts = {
  debug: false
};

describe('test loading a zest script as json', function () {
  var zc = new ZestCreator(opts, sampleZest);

  it('should load the given zest properly', function () {
    zc.script.title.should.be.exactly('my zest');
    zc.stmtIndex.should.be.exactly(32);
    zc.config.debug.should.be.exactly(false);
    zc.script.parameters.should.have.properties({
      tokenStart: '{{',
      tokenEnd: '}}',
      tokens: {},
      elementType: 'ZestVariables'
    });
  });

  it('should get 1st statement', function () {
    zc.getStatement(1).should.have.properties({
      comment: 'A comment',
      elementType: 'ZestComment',
      index: 1,
      enabled: true
    });
  });

  it('should get next statement', function () {
    var aStmt = zc.getStatement(1);
    aStmt = zc.nextStatement(aStmt);
    aStmt.should.have.properties({
      comment: 'another one',
      elementType: 'ZestComment',
      index: 2,
      enabled: true
    });
  });

  it('add a new statement', function () {
    zc.addStatement({ comment: 'last stmt', elementType: 'ZestComment'});
    zc.stmtIndex.should.be.exactly(33);
    zc.getStatement(33).should.have.properties({
      comment: 'last stmt',
      elementType: 'ZestComment',
      index: 33,
      enabled: true
    });
  });
});

describe('test loading a zest file', function () {
  var zc = new ZestCreator({file: 'testData/sampleDataSet2.zst'});

  it('should have correct attributes', function () {
    zc.script.title.should.be.exactly('my zest');
    zc.script.author.should.be.exactly('mocha');
    zc.stmtIndex.should.be.exactly(32);
 });

  it('should get 1st statement', function () {
    zc.getStatement(1).should.have.properties({
      comment: 'A comment',
      elementType: 'ZestComment',
      index: 1,
      enabled: true
    });
  });

  it('should get next statement', function () {
    var aStmt = zc.getStatement(1);
    aStmt = zc.nextStatement(aStmt);
    aStmt.should.have.properties({
      comment: 'another one',
      elementType: 'ZestComment',
      index: 2,
      enabled: true
    });
  });

  it('add a new statement', function () {
    zc.addStatement({ comment: 'last stmt', elementType: 'ZestComment'});
    zc.stmtIndex.should.be.exactly(33);
    zc.getStatement(33).should.have.properties({
      comment: 'last stmt',
      elementType: 'ZestComment',
      index: 33,
      enabled: true
    });
  });
});

describe('test loading various types of scripts', function () {
  var zc, z;

  it('should fail to load unrecognized script', function () {
    try {
      zc = new ZestCreator({file: 'testData/badType.zst'});
    } catch (e) {
      e.should.be.exactly('Error: Unrecognized script type ive');
    }
  });

  it('should make no type scipt to standalone', function () {
    zc = new ZestCreator({file: 'testData/noType.zst'});
    z = zc.getZest();
    z.type.should.be.exactly('Standalone');
  });

  it('should fail when non-passive stmts are in passive script', function () {
    try {
      zc = new ZestCreator({file: 'testData/failPassive.zst'});
    } catch (e) {
      e.should.be.exactly('Error: ZestRequest not allowed in passive scripts.');
    }
  });

  it('should add param tokens to passive scripts if no tokens', function () {
    zc = new ZestCreator({file: 'testData/missingTokensPassive.zst'});
    z = zc.getZest();
    z.parameters.tokens.should.have.properties('response.body',
      'response.header', 'request.body', 'request.header',
      'request.url', 'request.method');
  });

  it('should leave param tokens as it is if given, passive', function () {
    zc = new ZestCreator({file: 'testData/tokensPassive.zst'});
    z = zc.getZest();
    z.parameters.tokens.should.have.property('foo');
  })

  it('should auto add param tokens to active scripts', function () {
    zc = new ZestCreator({file: 'testData/missingTokensActive.zst'});
    z = zc.getZest();
    z.parameters.tokens.should.have.properties('request.header',
      'request.body', 'request.url', 'request.method');
  });

  it('should leave param tokens as it is if given, active', function () {
    zc = new ZestCreator({file: 'testData/tokensActive.zst'});
    z = zc.getZest();
    z.parameters.tokens.should.have.property('foo');
  });
});
