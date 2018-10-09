/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

module.exports = function (app) {
         
      app.route('/api/issues/:project')
      
        .get(function (req, res){
          var project = req.params.project;
          var query = req.query

          MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true},(err, db) => {
            if (err) { 
              console.log('Database error: ' + err) 
            }
            else {
              console.log('Database connected');
              db = db.db();
               
              var created = 'yo help'
              //Aggregation piepline
              var agg = db.collection('projects').aggregate([
                { $match: {'ProjectName': project}},
                { $unwind: '$issues'},
              ])
              
              if (query.title) {

                agg = agg.match({'issues.issue_title': query.title})
              }
              if (query.created_by) {
                agg = agg.match({'issues.created_by': query.created_by})
              }
              if (query.assigned_to) {
                agg = agg.match({'issues.assigned_to': query.assigned_to})
              }
              if (query.status_text) {
                agg = agg.match({'issues.status_text': query.status_text})
              }
              if (query.open) {
                agg = agg.match({'issues.open': query.status_open})
              }
              
              agg.group({_id: '$_id', 'ProjectName': {$first: '$ProjectName'}, 'issues': { '$push': '$issues' }})
                .project({_id: 0})
                .toArray((err, result) => {
                  if (err) throw err;
                  if (result) {
                    res.status(200).json(result);
                  }
                  else {
                    res.status(400).send('query error');
                  }
                })
                
              
            }
        })
      })
        //Creates new project/ add issue to existing
        .post(function (req, res){
          var project = req.params.project;
          var body = req.body;
          
          if (body.issue_title == null || body.issue_text == null || body.created_by == null) {
            return res.status(400).send('Missing required fields');
          };
        
          MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true},(err, db) => {
            if (err) { 
              console.log('Database error: ' + err) 
            }
            else {
              console.log('Database connected');
              db = db.db();
              //Finds project, creates one if does not exist, updates issues;
              let ID = new ObjectId();
              db.collection('projects')
                .findOneAndUpdate({ProjectName: project}, 
                                  {$setOnInsert: {ProjectName: project}, 
                                   $push: {issues: {_id: ID, issue_title: body.issue_title, issue_text: body.issue_text, created_by: body.created_by, assigned_to: body.assigned_to, status_text: body.status_text, created_on: new Date(), updated_on: '', open: true }}}, 
                                  {upsert: true, returnOriginal: false}, 
                                  (err, success) => {
                  if (err) throw err;
                  if (success) {
                    let index = success.value.issues.length - 1; 
                    res.status(200).json(success.value.issues[index]);
                  }
                  else {
                    res.status(200).json(success.value);
                  }
                })
              }
            })
      })
        //Updates issues based on _id
        .put(function (req, res){
          var project = req.params.project;
          var body = req.body;
          
          //If no fields
          if (Object.keys(body).length <= 1) {
            return res.status(400).send('no updated field sent')
          }
          //Test if id is valid
          try {
            var ID = ObjectId(body._id);
          }
          catch(err) {
            return res.status(400).send('_id must be a single String of 12 bytes or a string of 24 hex characters');
          }
          
          if (body.open == null) {
           body.open == true; 
          }
          
          MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true},(err, db) => {
            if (err) { 
              console.log('Database error: ' + err) 
            }
            else { 
            
              db = db.db();
              
              db.collection('projects')
                .findOneAndUpdate({ 'issues._id': ID }, { $set: { 'issues.$.issue_text': body.issue_text, 'issues.$.status_text': body.status_text, 'issues.$.open': body.open, 'issues.$.updated_on': new Date() }}, (err, result) => {
                  if (err) throw err;
                  if (result.value != null) {
                    res.status(200).send('successfully updated')
                  }
                  else {
                    res.status(400).send('could not update')
                  }
                })
            }})
        })

        .delete(function (req, res){
          var project = req.params.project;
          if (Object.keys(req.body).length < 1) {
            return res.status(400).send('_id error');
          }
          try {
            var ID = ObjectId(req.body._id);
          }
          catch(err) {
            return res.status(400).send('_id error');
          }
          
          MongoClient.connect(process.env.DATABASE, {useNewUrlParser: true},(err, db) => {
            if (err) { 
              console.log('Database error: ' + err) 
            }
            else {
            
              db = db.db();
              
              db.collection('projects').update({ProjectName: project}, { $pull: {issues: {'_id': ID }} }, {multi: true}, (err, success) => { 
                if (err) throw err;
                if (success) {
                  res.status(200).send('deleted');
                }
                else {
                  res.status(400).send('could not delete');
                }
              })
            } 
          });
        
        });
}