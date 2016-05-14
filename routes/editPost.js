
/*
 * GET home page.
 */
var wordpress = require( "wordpress" );

var client = wordpress.createClient({
	url: "http://localhost/Wordpress/",
	username: "cmpe272",
	password: "cmpe272"
});


exports.editPost = function(req, res){
	var title;
	client.getPosts(function( error, posts ) {
		for(var i = 0; i < posts.length; i++){
			title = posts[i].title;
			res.render('editPost', { postName: title });
		}
	});
	res.render('editPost', { postName: title });

};