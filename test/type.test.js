//import jsType from '../src/js/module/type';
var jsType = require('../src/js/module/type');

var assert = require('assert');

describe('type', function() {
  describe('jsType()', function() {
    it('1 ---- number', function() {
      assert.equal('number',jsType(1))
    });
    it('[] ---- array', function() {
      assert.equal('array',jsType([]))
    });
    it('{} ---- object', function() {
      assert.equal('object',jsType({}))
    });
    it('null ---- null', function() {
      assert.equal('null',jsType(null))
    });
    it('undefined ---- undefined', function() {
      assert.equal('undefined',jsType(undefined))
    });
  })
})