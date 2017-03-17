var http = require("http");
var url = require("url");
var path = require('path')
var formidable = require('formidable')
var fs = require('fs')
var mkdirp = require('mkdirp');
var dirTree = require('directory-tree');
var rmdir = require('rmdir');
function start() {

	var express = require('express');
	app = express();
	var bodyParser = require('body-parser')
	// app.use(express.bodyParser());
	app.use(bodyParser.json());
	
	app.use(express.static(__dirname + '/statics'));
	app.use(express.static(__dirname + '/uploads'));

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	});



	app.get('/', function (req, res) {
		res.sendFile(__dirname + '/index.html')
	});
	app.get('/getFileNames',function(req,res){
		var fileNames = []
		var tree = dirTree('./uploads/');
		res.send({"files":tree.children})
		/*fs.readdir("./uploads", (err, files) => {
			for(var f = 0; f<files.length;f++){
				fileNames.push(files[f]);
				
			}
			res.send({"files":fileNames});

		})*/
		//console.log(fileNames[0])
		
	});
	app.post('/deleteFile',function(req,res){
		console.log(req.body)
		if(req.body.fileName.charAt(req.body.fileName.length-1) =="/"){
			rmdir(__dirname + "/uploads/" + req.body.fileName, function (err, dirs, files) {
				
				console.log('all files are removed in ' +req.body.fileName);
				res.end(JSON.stringify('success'));
			});
		}
		else{
			fs.unlink(__dirname + "/uploads/" + req.body.fileName, function(err){
				res.end(JSON.stringify('success'));
				//res.send(JSON.stringify({"message":"success"}));

			});
			//console.log(fileNames[0])
			//res.end('success');
		}
		
		
	});


	
	app.post('/upload', function(req, res){

	  // create an incoming form object
		var form = new formidable.IncomingForm();

		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;

		// store all uploads in the /uploads directory
		form.uploadDir = path.join(__dirname, '/uploads');
		// every time a file has been uploaded successfully,
		// rename it to it's orignal name

		console.log("---------------------------")

		form.on('file', function(field, file) {
			var directoryName = ""
			for(var n = file.name.length; n>-1;n--){
				if(file.name.charAt(n) == "/"){
					directoryName = file.name.substring(0,n);
					break;
				}
			}
			
			directoryName = path.join( form.uploadDir + "/" + directoryName)
			var filePath = path.join(form.uploadDir + "/" + file.name)
			console.log(filePath   + ":    filePath")
			console.log(directoryName + ":    directoryName")
			mkdirp(directoryName, function(err){
				if(err){
					console.log(err);
				}
				else{
					console.log(file.name);
					fs.rename(file.path, path.join(form.uploadDir, file.name));
				}
			})
			
			//console.log(file.path)
		});
		

		
		console.log("---------------------------")
		// log any errors that occur
		form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
		});

		// once all the files have been uploaded, send a response to the client
		form.on('end', function() {
			res.end('success');
		});

		// parse the incoming request containing the form data
		form.parse(req);

	});

	
	
	var port = 8080;
	

	var server = app.listen(port);
	

	
	console.log("Server has started");
}

exports.start = start;