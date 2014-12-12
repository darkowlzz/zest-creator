var ZestCreator = require('../'),
    should = require('should');


describe('create a ZestCreator object', function () {
  it('should create an object with default config', function () {
    var zc = new ZestCreator();
    zc.config.should.have.properties('title', 'description', 'client',
                                     'author');
  });

  it('should create an object with the given config', function () {
    var opts = {
                 title: 'my zest',
                 description: 'a little zest script',
                 client: 'test client',
                 author: 'mocha'
               };
    var zc = new ZestCreator(opts);
    zc.config.should.have.property('title', 'my zest');
    zc.config.should.have.property('description', 'a little zest script');
    zc.config.should.have.property('client', 'test client');
    zc.config.should.have.property('author', 'mocha');
  });
});
