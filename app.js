const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
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

// rendering main page
app.get('/', (req, res) => {
	// check if user is logged in
	if(req.session.loggedin){
		getButtonData(req.session.email).then((buttonData) => {
			// load page with user data
			res.render('index', {
				loggedin: req.session.loggedin,
				username: req.session.username, 
				email: req.session.email,
				// buttions information
				buttonData: buttonData
			});
		});		
	} else {
		res.render('index');
	}
	console.log(req.session.username);
});

// rendering user login page
app.get('/login', (req, res) => {
	res.render('login');
});

// user logout action
app.get('/logout', (req, res) => {
	req.session.loggedin = false;
	req.session.username = undefined;
	req.session.email = undefined;
	res.redirect('/');
	res.end();
})

// user login action
app.post('/auth', (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	
	// if data entered successfully
	if(email && password){
		// connect to db
		const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
		client.connect(() => {
			client.db('sample_mflix').collection('users').find({'email': email, 'password': password}).toArray().then(user => {
				client.close();
				// if there is a match betweed entered data and db data
				if(user.length > 0){
					req.session.loggedin = true;
					req.session.email = user[0].email;
					req.session.username = user[0].name;
				} else {
					req.session.loggedin = false;
				}
				res.redirect('/')
				res.end();
			})
		})
	}
})

// getting button data from database
let getButtonData = (email) => {

}

// user registration page
app.use('/register', (req, res) => {
	res.render('register');
});

// loading 404 page if page not found
app.use('/*', (req, res) => {
	res.sendFile(__dirname + "/public/404.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
