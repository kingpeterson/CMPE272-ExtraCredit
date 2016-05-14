
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var wordpress = require( "wordpress" );
var fs = require( "fs" );

var client = wordpress.createClient({
	url: "http://localhost/Wordpress/",
	username: "cmpe272",
	password: "cmpe272"
});


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

client.getPosts(function( error, posts ) {
	console.log(posts);
	console.log( "Found " + posts.length + " posts!" );
	var postId = [];
	var terms = [];
	for(var i = 0; i < posts.length; i++){
		postId[i] = posts[i].id;
		terms[i] = posts[i].terms;
		console.log(postId[i]);
//		console.log(terms[i]);
//		for(var j = 0; j < terms[i].length; j++){
//			console.log(terms[i][j].name);
//		}
	}
});


// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/', routes.editPost);
app.get('/users', user.list);
app.get('/newPost', function(req, res){
	res.render('newPost');
});

app.get('/editPost', function(req, res){
	var title = [];
	var postId = [];
	client.getPosts(function( error, posts ) {
		for(var i = 0; i < posts.length; i++){
			postId[i] = posts[i].id;
			title[i] = posts[i].title;
		}
		res.render('editPost', {postName: title, postId: postId});
	});
});

app.get('/tag', function(req, res){
	res.render('tag');
});

app.get('/deletePost', function(req, res){
	var title = [];
	var postId = [];
	client.getPosts(function( error, posts ) {
		for(var i = 0; i < posts.length; i++){
			postId[i] = posts[i].id;
			title[i] = posts[i].title;
		}
		res.render('deletePost', {postName: title, postId: postId});
	});
});

app.post('/newPost', function(req, res){
	 var title = req.param('title', null); 
	 var tag = req.param('tag', null);
	 var content = req.param('post', null);
	 var picName = req.files.pic.name;
	 var picType = req.files.pic.type;
	 var pic = fs.readFileSync( req.files.pic.path );
	 var myPostId;
	 console.log(picName);
	 console.log(picType);
	 console.log(pic);

	 console.log("title");
	 console.log(title);
	 console.log("post");
	 console.log(content);
	 client.newPost({
			title: title,
			content: content,
			status: "publish",
			termNames: {
				"category": ["Javascript", "Node"],
				"post_tag": [tag]
			}
		}, function( error, id ) {
			console.log( arguments );
			console.log("new post id:");
			console.log(id);
			myPostId = id;
			
			client.uploadFile({
				name: picName,
				type: picType,
				bits: pic,
				postId: id
			}, function(error, file){
				console.log(file);
				console.log(error);
//				client.editPost(myPostId,{
//					content: content + file.url
//				}, function(error, id){
//					console.log(id);
//					console.log(error);
//				});
			});
			
			res.redirect('http://localhost/Wordpress/');
		});
//	 res.send(title + "\n" + content);
});

app.post('/editPost', function(req, res){
	 var id = req.param('postId', null); 
	 var title = req.param('title', null); 
	 var content = req.param('post', null);
	 client.editPost(id,{
		 title: title,
		 content: content
	 }, function(error, id){
		console.log(id);
		console.log(error);
	 });
	 client.getPost(id, function(error, post){
		res.redirect(post.link);
	 });
//	 res.send("Edit Post:" + title + " completed");
});

app.post('/tag', function(req, res){
	var tag = req.param('tag', null);
	var title = [];
	var content = [];
	client.getPosts(function( error, posts ) {
		var terms = [];
		for(var i = 0; i < posts.length; i++){
			terms[i] = posts[i].terms;
//			console.log(terms[i]);
			for(var j = 0; j < terms[i].length; j++){
				if(terms[i][j].name === tag){
					console.log(terms[i][j].name);
					title[i] = posts[i].title;
					content[i] = posts[i].content;
					break;
				}
			}
		}
		res.render('tagResult', {title: title, content: content});
	});
//	res.send();
});

app.post('/deletePost', function(req, res){
	 var id = req.param('postId', null); 
	 client.deletePost(id, function(error){
		 console.log(error);
		 if(error === null){
			 res.send("Delete Post:" + id + " success");
		 }
	 });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
