# Latest updates #
* A remote MongoDB server is avaiable for testing. See Project Setup for details

# README #

This readme will guide you through the project setup for development

# Project OPS #
## Online Point-of-Sale System ##
* Powered by [jQuery](https://jquery.com/), [NodeJS](https://nodejs.org/) and [MongoDB](https://www.mongodb.org/)
* Built on [nodemon](http://nodemon.io/), [gulp.js](http://gulpjs.com/), [BrowserSync](https://www.browsersync.io/), [Express](http://expressjs.com/) and more
* Check [package.json](https://bitbucket.org/nvbach91/ops2x/src/6a54a7c8b8de1458bc52d4b43d6ec9a1ec3e4991/package.json?fileviewer=file-view-default) file for details

## Project Setup ##
### Requirements ###
* NodeJS with npm
* install from https://nodejs.org/
* check your installation with 
```
$ node -v
$ npm -v
```

* MongoDB (optional)
* install from https://www.mongodb.org/downloads
* check your installation with 
```
$ mongod --version
```
\* you might want to add MongoDB's bin to you system's PATH

* Instead of installing a local MongoDB you can connect to a remote server. By default, the project assumes you choose to use a local MongoDB instance. Check line ``14`` in ``~/ops2x/app.js`` in case you don't want to install MongoDB and use the remote one instead.

* navigate to project folder to continue
```
$ cd ~/ops2x
```

### Build system ###
* install global packages to NodeJS
```
$ npm install -g gulp nodemon

```
* install local node module packages for our project
```
$ npm install
```

### Database (optional) ###
* configure default database path and run database service
```
$ mkdir C:/data/db/
$ mongod
```
* OR you can also specify mongod path with
```
$ mongod --dbpath C:/path/to/your/database/directory/
```
* populate the database with provided databasedump folder using mongorestore, the database name must be 'test'
```
# run mongod if not yet started
$ mongorestore --db test ./databasedump/test/
```
* verify your restore with
```
$ mongo
> show dbs
local 0.000GB
test  0.000GB
> use test
switched to db test
> show collections
catalogs
settings
users
> db.users.find().pretty()
{
        "_id" : ObjectId("56d0c91ae54d691539c9e7c4"),
        "email" : "guest",
        "password" : "e1a928ad6fae2646ddee08a99..."
}
```

## Run project ##
* the following commands will run project tasks to start the server and open your system's default web browser and navigate you to the app
* if your browser does not start, manually open the app at http://localhost:7000

```
$ npm start
or
$ gulp
```

* login for user guest
```
username: "guest", password: "tseug"
```

* project tasks include watch task with live reload which automatically restarts the server when server files change, and inject client scripts when client files change

* during development you can restart the server with nodemon
```
rs
```

* BrowserSync is awesome! Open multiple browsers, i.e. on you phone, table and desktop and navigate to the app and watch BrowserSync show off!

## Todos ##
* implement settings module
* add virtual keyboard
* resite pay button
* add quickSale categories
* add manual product name input
* EAN PLU in price input?
* implement sale history
