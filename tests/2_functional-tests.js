/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(4000);
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');      
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Required title',
            issue_text: 'Required text',
            created_by: 'Required'
        })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.type, 'application/json');
            assert.equal(res.body.issue_title, 'Required title');
            assert.equal(res.body.issue_text, 'Required text');
            assert.equal(res.body.created_by, 'Required');
            done();
        })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_text: 'Required text'
        })
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'Missing required fields');
            done();
        })
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/apitest')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'no updated field sent');
            done();
        })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
          .put('/api/issues/apitest')
          .send({_id: '5bbaee6fda75be0e7387d8e1', open: false})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
        })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/apitest')
          .send({_id: '5bbaeed3da75be0e7387d8e2',
                  issue_text: 'testing',
                  open: false})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body[0].issues);
          assert.property(res.body[0].issues[0], 'issue_title');
          assert.property(res.body[0].issues[0], 'issue_text');
          assert.property(res.body[0].issues[0], 'created_on');
          assert.property(res.body[0].issues[0], 'updated_on');
          assert.property(res.body[0].issues[0], 'created_by');
          assert.property(res.body[0].issues[0], 'assigned_to');
          assert.property(res.body[0].issues[0], 'open');
          assert.property(res.body[0].issues[0], 'status_text');
          assert.property(res.body[0].issues[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({title: 'Required title'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body[0].issues);
          assert.equal(res.body[0].issues[0].issue_title, 'Required title');
          done();
        })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({title: 'Required title', 
                issue_text: "Required text",
                created_by: "Required"})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body[0].issues);
          assert.equal(res.body[0].issues[0].issue_title, 'Required title');
          assert.equal(res.body[0].issues[0].issue_text, 'Required text');
          assert.equal(res.body[0].issues[0].created_by, 'Required');
          done();
        })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .end((err,res) => {
            assert.equal(res.status, 400);
            assert.equal(res.text, '_id error');
            done();
        })
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({_id: '5bbafabf31f7a75732da9a79'})
          .end((err,res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'deleted');
            done();
        })
      });
      
    });

});
