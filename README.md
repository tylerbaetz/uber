E-mail Backend Application
==============

This application implements a communications platform to send e-mail messages via either the Mailgun or Mandrill API.
The program accepts JSON POST requests to the '/email' route and forwards them to the default provider specified in the config file.
If the provider does not respond or returns an error, the application attempts to send the mail again using the alternate provider.
Upon successfully mail delivery, the program returns a confirmation message to the user as well as saves a record in a local database.

Installation
==============
This application requires that Node.js be installed on the target system.  MongoDB is also required to save records to a local database.

Navigate to the project root directory and run
	`npm install`
to install dependencies.  After they are installed simply run
	`node app.js`


Configuration
==============
The config.js file contains various parameters for configuring the application.
- defaultProvider:	default service for sending messages.  Expects "MAILGUN" or "MANDRILL" values
- port:	port for the application to run on
- moongose: MongoDB connection string
- mailgun.uri: path to MAILGUN HTTP API
- mailgun.username: username for MAILGUN HTTP API
- mailgun.password: API key for MAILGUN
- mandrill.uri: path to MANDRILL HTTP API
- mandrill.password: API key for MANDRILL


Usage
==============
	('/email')
To send an email, issue a POST request to '/email' with JSON:<br>
	`"to": "fake@email.com",`<br>
	`"to_name": "Ms. Fake",`<br>
	`"from": "noreply@uber.com",`<br>
	`"from_name": "Uber",`<br>
	`"subject": "A Message From Uber",`<br>
	`"body": "<h1>Your Bill</h1><p>$10</p>"`<br>

	('/list')
To view the database of sent emails, issue a GET request to the '/list' endpoint.

	('/list/clear')
To clear the database of sent emails, issue a GET request to the '/list/clear' endpoint.

	('/list/to/:to')
To filter the database by the destination address, issue a GET request to the '/list/to/:to' endpoint where :to is the destination address.

	('/list/from/:from')
To filter the database by the source address, issue a GET request to the '/list/from/:from' endpoint where :from is the source address.

	('/list/provider/:provider')
To filter the database by the service provider, issue a GET request to the '/list/provider/:provider' endpoint where :provider is the service provider.


Tests
==============
The test/ directory contains unit tests for the node application including test cases for invalid input and request timeouts.
Tests can be executed by issuing the command
	`mocha`
	

Why Node.js?
=====================
I chose to implement this project in Node.js primarily because Uber's stack consists of both Python and Node.js.
Although my main skillset is Java, I have intermediate experience with Javascript and decided to dive into Node.js to gain exposure to this powerful platform.

I chose to use the Express web framework for Node.js as it is simple, lightweight, and focused on high performance.  The framework provides some more robust features as well, however this application only requires a few basic routes.

I also chose to implement a database in MongoDB to store a record of each successfully processed email.  Although a relational database like MySQL would work well in this scenario, MongoDB was chosen due to the flexibility of its document-based data model.  This defining characteristic, along with the database's speed and scalability, makes MongoDB an ideal candidate for web applications.

TODOS
======================
- Decouple the server requests from the mocha test cases using Sinon.JS
- Implement more robust error handling
- GUI form at GET('/email') to provide an interface for application

