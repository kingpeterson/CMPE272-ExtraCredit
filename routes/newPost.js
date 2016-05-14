var wordpress = require( "wordpress" );

var client = wordpress.createClient({
	url: "http://localhost/Wordpress/",
	username: "cmpe272",
	password: "cmpe272"
});

client.newPost({
	title: "My New Post",
	content: "Publishing to WordPress from node.js sure is fun!",
	status: "publish",
	termNames: {
		"category": ["Javascript", "Node"],
		"post_tag": ["api", "fun", "js"]
	}
}, function( error, data ) {
	console.log( arguments );
});
