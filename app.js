const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const { render } = require('pug');
const MongoClient = mongodb.MongoClient;
const uri = (require('./config.json')).uri;
const app = express();
const port = process.env.PORT || 3000;	

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'pug');

app.use(session({
	secret: 'secret',
	cookie: { maxAge: 60000 },
	resave: true,
	saveUninitialized: true
}));

// get button data from database
const getButtonData = (email, callback) => {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(() => {
		client.db('sample_mflix').collection('buttons').find({'user_email': email}).toArray().then((buttons) => {
			client.close();
			return callback(buttons[0]);
		});
	});
}

//get button fata route
app.get('/getButtons', (req, res) => {
	getButtonData(req.query.email, (buttonData) => {
		res.send(buttonData);
		res.end(); 
	});
});

const getUsers = (callback) => {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(() => {
		client.db('sample_mflix').collection('buttons').find({}).toArray().then((buttons) => {
			client.close();
			return callback(buttons);
		});
	});
}

// render main page
app.get('/', async (req, res) => {
	// check if user is logged in
	if(req.session.loggedin){
		const buttonData = await getButtonData(req.session.email, (buttonData) => {
			// load page with user data
			res.render('index', {
				loggedin: req.session.loggedin,
				email: req.session.email,
				isAdmin: req.session.isAdmin,
				// buttons information
				button1_number: buttonData.button1_number,
				button2_number: buttonData.button2_number,
				button3_number: buttonData.button3_number
			});
		});
	} else {
		res.render('index');
	}
});

// increasing button.press count
app.get('/increment', (req, res) => {
	let button_number = req.query.button_number;
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(() => {
		// https://stackoverflow.com/questions/17039018/how-to-use-a-variable-as-a-field-name-in-mongodb-native-findone
		let query = {}
		query[button_number] = 1;
		client.db('sample_mflix').collection('buttons').updateOne({'user_email': req.session.email}, { $inc: query}).then(() => {
			client.close();
			getButtonData(req.session.email, (buttonData) => {
				res.send(buttonData[button_number]);
				res.end();
			});
		});
	});
});

// render user login page
app.get('/login', (req, res) => {
	res.render('login');
});

// user login action
app.post('/auth', (req, res) => {
	let email = req.body.email;
	// if data entered successfully
	if(email){
		// connect to db
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect(() => {
			client.db('sample_mflix').collection('users').find({'email': email}).toArray().then(user => {
				client.close();
				// if there is a match betweed entered data and db data
				if(user.length > 0){
					req.session.loggedin = true;
					req.session.email = user[0].email;
					req.session.isAdmin = user[0].isAdmin;
					res.redirect('/');
				} else {
					req.session.loggedin = false;
				}				
				res.end();
			})
		})
	}
})

// user logout action
app.get('/logout', (req, res) => {
	req.session.loggedin = false;
	req.session.email = undefined;
	req.session.isAdmin = false;
	res.redirect('/');
	res.end();
})

//render admin page
app.get('/admin', (req, res) => {
    //check if user isAdmin
	if(req.session.isAdmin){
		getUsers((data) => {
			res.render('admin', {array: data});
		});
	} else {
		res.sendFile(__dirname + "/public/404.html");
	}
});

const deleteEl = (user_email) => {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	client.connect(() => {
		client.db('sample_mflix').collection('buttons').deleteOne({'user_email': user_email}).then(() => {
			client.close();
		});
	});
}

// user remove route
app.get('/deleteEl', async (req, res) => {
	await deleteEl(req.query.user_email);
	res.end();
});

// load 404 page if page not found
app.use('/*', (req, res) => {
	res.sendFile(__dirname + "/public/404.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
