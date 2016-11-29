var express = require('express');
var app = express();
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/shoppingKart';
var bodyParser = require('body-parser');
var cors = require('cors');

var mongoObj = null
var userTable = 'user'
var productTable = 'product'

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(cors());

var openConnection = function () {
	mongoClient.connect(mongoUrl, function (err, db) {
		if (err) {
			console.log('Error->', err)
		} else {
			console.log('Connected Successfully');
			mongoObj = db
		}
	})
}

openConnection()

app.post('/login', function (req, res) {
 	if (mongoObj !== null) {
 		var collectionObj = mongoObj.collection(userTable);
 		collectionObj.find({'mobileNumber': parseInt(req.body['mobileNumber'])}).toArray(function (err, result) {
			console.log(result)
 			if (err) {
 				res.json({
					'status': false,
					'message': 'Data Failure'
				})
 			} else if (result.length === 0) {
 				res.json({
					'status': false,
					'message': 'Invalid Mobile Number or Password'
				})
 			} else {
 				if (req.body['password'] === result[0]['password']) {
					console.log(result[0]['emailID'])
 					res.json({
 						'userData': {
							"userName": result[0]['userName'],
							"memberID": result[0]['memberID'],
							"mobileNumber": result[0]['mobileNumber'],
							"emailID": result[0]['emailID']
						},
						'status': true,
						'message': 'Valid Credentials'
					})	
 				} else {
 					res.json({
						'status': false,
						'message': 'Invalid Mobile Number or Password'
					})
 				}
 			}

 		})
 	} else {
 		res.json({
			'status': false,
			'message': 'Connection Failure'
		})
 	}
})

app.post('/registerUser', function (req, res) {
	if (mongoObj !== null) {
		var collectionObj = mongoObj.collection(userTable);
		collectionObj.insert({
			'userName': req.body['userName'],
			'memberID': req.body['memberID'],
			'mobileNumber': req.body['mobileNumber'],
			'password': req.body['password'],
			'emailID': req.body['emailID']
		}, function (err, result) {
			if (err) {
				console.log(err)
				res.json({
					'status': false,
					'message': 'Problem with inserting data'
				})
			} else if (result['result']['ok']) {
				res.json({
					'status': true,
					'message': 'User registration done successfully'
				})
			} else {
				res.json({
					'status': false,
					'message': 'Registration unsuccessful'
				})
			}
		})
	} else {
		res.json({
			'status': false,
			'message': 'Connection Failure'
		})
	}
})

app.post('/updateUser', function (req, res) {
	if (mongoObj !== null) {
		var collectionObj = mongoObj.collection(userTable);
		collectionObj.update({'mobileNumber': req.body['mobileNumber']}, {'$set': {
			'userName': req.body['userName'],
			'memberID': req.body['memberID'],
			'emailID': req.body['emailID']
		}}, function (err, result) {
			if (err) {
				console.log(err)
				res.json({
					'status': false,
					'message': 'Problem with updating data'
				})
			} else if (result['result']['ok']) {
				res.json({
					'status': true,
					'message': 'User updation done successfully'
				})
			} else {
				res.json({
					'status': false,
					'message': 'Updation unsuccessful'
				})
			}
		})
	} else {
		res.json({
			'status': false,
			'message': 'Connection Failure'
		})
	}
})

app.get('/getAllProduct', function (req, res) {
	if (mongoObj !== null) {
		var collectionObj = mongoObj.collection(productTable);
		collectionObj.find().toArray(function (err, result) {
			if (err) {
				console.log('Error->', err);
				res.json({
					'status': false,
					'message': 'Fetching data unsuccessful'
				})
			} else if (result.length) {
				res.json({
					'status': true,
					'message': 'Data fetching successful',
					'productsData': result 
				})
			} else {
				res.json({
					'status': false,
					'message': 'No data found'
				})
			}
		})
	}
})

app.get('/getProduct', function (req, res) {
	if (mongoObj !== null) {
		var collectionObj = mongoObj.collection(productTable);
		collectionObj.find({'barCodeNumber': parseInt(req.query['barCodeNumber'])}).toArray(function (err, result) {
			if (err) {
				console.log('Error->', err);
				res.json({
					'status': false,
					'message': 'Fetching data unsuccessful'
				})
			} else if (result.length) {
				res.json({
					'status': true,
					'message': 'Data fetching successful',
					'productsData': result[0] 
				})
			} else {
				console.log(result.length)
				res.json({
					'status': false,
					'message': 'No data found'
				})
			}
		})
	}
})

app.get('/productImage', function(req, res) {
	var file = req.query['pathName'];
	res.download(file)
})

var server = app.listen(4000, function() {
	console.log('Listening to http://%s:%s', server.address().address, server.address().port)
});
