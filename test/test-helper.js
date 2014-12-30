'use strict';

var should     = require('should'),
    helper     = require('../helper'),
    sampleZest = require('./sampleDataSet').sampleZest;


describe('test helper functions', function () {
  it('should get correct statement', function () {
    var stmt = helper.getStatement(sampleZest.statements, 3);
    stmt.index.should.be.exactly(3);
  });

  it('should be a substatement', function () {
    helper.isSubStatement(sampleZest.statements, 6).should.be.true;
  });

  it('should not be a substatement', function () {
    helper.isSubStatement(sampleZest.statements, 3).should.be.false;
  });

  it('should get parent', function () {
    helper.getParent(sampleZest.statements, 6).index.should.be.exactly(5);
  });

  it('should not get parent', function () {
    (helper.getParent(sampleZest.statements, 2) === null).should.be.true;
  });
});
