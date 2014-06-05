var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var logmailSchema = new Schema({
    to: String,
    to_name: String,
    from: String,
    from_name: String,
    subject: String,
    body: String,
    provider: String,
    creationDate: {
        type: Date,
        'default': Date.now
    },
    ip_addr: String,
});
var model = mongoose.model('Logmail', logmailSchema);
var config = require('../config');

describe('Routing', function () {
    var url = 'localhost:3000';

    before(function (done) {
        mongoose.connect(config.mongoose);
        done();
    });
	/* This function tests the '/email' endpoint including sending invalid and missing inputs and checking for error cases */
    describe('Email', function () {
        it('should return error on GET', function (done) {
            request(url)
                .get('/email')
                .expect(404)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else
                        done();
                });
        });

        it('should return error with no arguments', function (done) {
            var mail = {};
            request(url)
                .post('/email')
                .send(mail)
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else
                        done();
                });
        });

        it('should return error with missing arguments', function (done) {
            var mail = {
                "to": "fake@email.com",
                "from": "noreply@uber.com",
                "subject": "Uber",
                "body": "<h1>Your Bill</h1><p>$10</p>"
            };
            request(url)
                .post('/email')
                .send(mail)
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else
                        done();
                });
        });

        it('should return error with invalid email', function (done) {
            var mail = {
                "to": "fake@@email.com",
                "to_name": "Ms. Fake",
                "from": "noreply@uber.com",
                "from_name": "Uber",
                "subject": "A Message from Uber",
                "body": "<h1>Your Bill</h1><p>$10</p>"
            };

            request(url)
                .post('/email')
                .send(mail)
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else
                        done();
                });
        });

        it('should return error with empty body', function (done) {
            var mail = {
                "to": "fake@email.com",
                "to_name": "Ms. Fake",
                "from": "noreply@uber.com",
                "from_name": "Uber",
                "subject": "A Message From Uber",
                "body": ""
            };

            request(url)
                .post('/email')
                .send(mail)
                .expect(400)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else
                        done();
                });
        });

        it('should return MAILGUN success', function (done) {
            var mail = {
                "to": "email@fake.com",
                "to_name": "Ms. Fake",
                "from": "uber@noreply.com",
                "from_name": "Uber",
                "subject": "A Message From Uber",
                "body": "<h1>Your Bill</h1><p>$10</p>"
            };
            request(url)
                .post('/email')
                .send(mail)
                .expect(200, 'Mail sent using MAILGUN\n')
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else {
                        model.findOne({}, {}, {
                            sort: {
                                'creationDate': -1
                            }
                        }, function (error, logmail) {
                            if (error)
                                done(error);
                            else {
                                logmail.to.should.equal(mail.to);
                                logmail.from.should.equal(mail.from);
                                logmail.subject.should.equal(mail.subject);
                                logmail.provider.should.equal("MAILGUN");
                                done();
                            }
                        });
                    }
                });
        });

        it('should force MAILGUN error and return MANDRILL success', function (done) {
            var mail = {
                "to": "fake@email.com",
                "to_name": "Ms. Fake",
                "from": "noreply@uber.com",
                "from_name": "Uber",
                "subject": "A Message From Uber",
                "body": "<h1>Your Bill</h1><p>$10</p>",
                "force_error": true
            };
            request(url)
                .post('/email')
                .send(mail)
                .expect(200, 'Mail sent using MANDRILL\n')
                .end(function (err, res) {
                    if (err)
                        done(err);
                    else {
                        model.findOne({}, {}, {
                            sort: {
                                'creationDate': -1
                            }
                        }, function (error, logmail) {
                            if (error)
                                done(error);
                            else {
                                logmail.to.should.equal(mail.to);
                                logmail.from.should.equal(mail.from);
                                logmail.subject.should.equal(mail.subject);
                                logmail.provider.should.equal("MANDRILL");
                                done();
                            }
                        });
                    }
                });
        });
    });

	/* This function tests the '/list' endpoint and assumes the mail objects from the successful '/email' test cases have been loaded into the database */    
    describe('List', function(){
		it('should list both messages', function(done){
			request(url)
				.get('/list')
				.expect(200)
				.end(function(err, res){
					if (err)
						done(err);
					else{
						res.body.should.containDeep([{to:'fake@email.com',from:'noreply@uber.com',provider:'MANDRILL'}]);
						res.body.should.containDeep([{to:'email@fake.com',from:'uber@noreply.com',provider:'MAILGUN'}]);
						done();
					}
				});
			});
		
		it('should list at least one message', function(done){
			request(url)
				.get('/list/to/fake@email.com')
				.expect(200)
				.end(function(err, res){
					if (err)
						done(err);
					else{
						res.body.should.containDeep([{to:'fake@email.com',from:'noreply@uber.com',provider:'MANDRILL'}]);
						done();
					}
				});
			});
			
		it('should list at least one message', function(done){
			request(url)
				.get('/list/from/uber@noreply.com')
				.expect(200)
				.end(function(err, res){
					if (err)
						done(err);
					else{
						res.body.should.containDeep([{to:'email@fake.com',from:'uber@noreply.com',provider:'MAILGUN'}]);
						done();
					}
				});
			});
			
		it('should list at least one message for each provider', function(done){
			request(url)
				.get('/list/provider/MANDRILL')
				.expect(200)
				.end(function(err, res){
					if (err)
						done(err);
					else
						res.body.should.containDeep([{to:'fake@email.com',from:'noreply@uber.com',provider:'MANDRILL'}]);
				});
				
			request(url)
				.get('/list/provider/MAILGUN')
				.expect(200)
				.end(function(err,res){
					if (err)
						done(err);
					else{
						res.body.should.containDeep([{to:'email@fake.com',from:'uber@noreply.com',provider:'MAILGUN'}]);						
						done();
					}
				});
			});
				
		it('should return empty after clearing', function(done){
			request(url)
				.get('/list/clear')
				.expect(200, 'Database cleared!\n')
				.end(function(err, res){
					if (err)
						done(err);
				});
				
			request(url)
				.get('/list')
				.expect(200)
				.end(function(err,res){
					if (err)
						done(err);
					else{
						res.body.should.be.empty;					
						done();
					}
				});
			});		
			
		});
		    
});
