var ZestCreator = require('../'),
    should = require('should'),
    _      = require('underscore');

var opts = {
  title: 'my zest',
  description: 'a little zest script',
  client: 'test client',
  author: 'mocha'
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

describe('pass zc basic zest statements', function () {
  it('getZest should return proper zest object', function () {
    var zc = new ZestCreator(opts);
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
  });

  it('should create 2 zest comment statements', function () {
    var zc = new ZestCreator(opts);
    zc.addStatement({ comment: 'A comment', elementType: 'ZestComment' });
    zc.addStatement({ comment: 'another one', elementType: 'ZestComment'});
    var r = zc.getZest();
    var stmt = r.statements[0];
    stmt.should.have.properties({
      comment: 'A comment',
      index: 1,
      elementType: 'ZestComment'
    });

    var stmt = r.statements[1];
    stmt.should.have.properties({
      comment: 'another one',
      index: 2,
      elementType: 'ZestComment'
    });
  });

  it('should create request statement', function () {
    var zc = new ZestCreator(opts);
    zc.addStatement({
      url: 'http://foo.com',
      method: 'GET',
      elementType: 'ZestRequest'
    });
    zc.addStatement({
      url: 'http://bar.com',
      body: 'qwerty',
      statusCode: 200,
      responseTimeInMs: 222,
      elementType: 'ZestResponse',
      subElement: true,
      parentIndex: 1
    });
    var r = zc.getZest();
    var stmt = r.statements[0];
    stmt.should.have.properties({
      url: 'http://foo.com',
      data: 'unknown',
      method: 'GET',
      headers: 'unknown',
      index: 1,
      elementType: 'ZestRequest'
    });
    stmt.response.should.have.properties({
      url: 'http://bar.com',
      body: 'qwerty',
      statusCode: 200,
      responseTimeInMs: 222,
      elementType: 'ZestResponse'
    });
  });
});
