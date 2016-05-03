# Project home #
* I recommend you go to the git repository for because of updates and stuff
```
https://nvbach91@bitbucket.org/nvbach91/ops2x.git
```

# Latest updates #
* Preview version is now online. [https://ops2x-62687.onmodulus.net/](https://ops2x-62687.onmodulus.net/)
* https server is available with self signed key for testing, see Run Project for details

# Quick start #
```
$ git clone https://nvbach91@bitbucket.org/nvbach91/ops2x.git
$ cd ./ops2x  # navigate to project root
$ npm install # install project dependencies
$ mongod      # open a new CMD and start mongod on localhost:27017
$ npm run dev # this will fire up the project
```

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

* MongoDB
* install from https://www.mongodb.org/downloads
* check your installation with 
```
$ mongod --version
```
\* you might want to add MongoDB's bin to you system's PATH

* Instead of installing a local MongoDB you can connect to a remote server. By default, the project assumes you choose to use a local MongoDB instance. Chnage file ``~/ops2x/config.js`` accordingly

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

* Note: If you see red problems and warnings regarding socket.io (and freak out because you're not familiar with NodeJS), the project should still work and can be started, but if you want a clean installation with no errors and warnings, check [this solution](https://github.com/npm/npm/issues/9563#issuecomment-142666465)

### Mail service ###
* create a gmail account and enable less secure apps
* in file ``config.js`` replace it with your gmail account and password

### Database ###
* you can skip this part if you already have a MongoDB running somewhere
* configure default database path and run database service
```
$ mkdir C:/data/db/
$ mongod
```
* OR you can also specify mongod path with
```
$ mongod --dbpath C:/path/to/your/database/directory/
```
* open mongo shell and create a database with the same name as in your config file
```
$ mongo
> use testx
```

## Run project ##
* the following commands will run project tasks to start the server and open your system's default web browser and navigate you to the app
* if your browser does not start, manually open the app at ``localhost:7000``

```
$ npm run dev       # run in development mode
$ npm run devhttps  # run in development mode with https
$ npm start         # run in normal mode, this is used as the basic start command in production
```

* project tasks include watch task with live reload which automatically restarts the server when server files change, and inject client scripts when client files change

* during development you can restart the server with nodemon
```
rs
```

* BrowserSync is awesome! Open multiple browsers, i.e. on you phone, table and desktop and navigate to the app and watch BrowserSync show off!

## Deployment on modulus ##
* go grab an account on [Modulus](https://modulus.io)
* create a Node.js project and a MongoDB instance in your account
* install modulus with npm, follow the instructions on modulus
```
npm install -g modulus
```
* change the host and mongo uri in the ``config.js`` file
* type ``modulus login`` and provide credentials
* navigate to project root folder and type ``modulus deploy``

## Todos ##
* offline mode + resync 
* rebuild settings interface
* complex business model
* ~~add virtual keyboard~~
* ~~resite pay button~~
* ~~add manual product name input~~
* ~~EAN PLU in price input?~~
* ~~add quickSale categories (tabs)~~
* ~~implement sale history~~
* ~~implement settings module~~
* ~~add keyboard shortcuts~~

## User guide ##
### Printer setup ###
* buy a thermal receipt printer and install its driver, buy a 80mm width type
* open you web browser (try to use Chrome lads)
* CTRL+P to open print dialog and set printer to the thermal printer
* change margins to none and you're good to go

### Barcode scanner setup ###
* plug you scanner to a free USB port

### Accounts ###
* register an account
* login with that account
* open cash register with "Admin" and PIN "0000"
* go to settings and create a new employee

### Sale ###
* use you keyboard to enter prices, you can tap Numpad Enter to call price input, then use sale group buttons to add it to checkout
* use virtual keyboard to enter prices, then use sale group buttons to add it to checkout
* use quick sale buttons to instantly register a common item
* use barcode scanner to instantly register an item from the catalog
* once done registering click on Pay and then enter the amount tendered and click DONE or click Print first then click DONE

### Catalog ###
* go to settings and open Edit PLU
* now you can import a plaintext CSV file, use export to get an example of the file format
* you can use the search button to look for codes, existing codes are highlighted blue, and non-existing codes are highlighted green

### Checkout ###
* you can manipulate the checkout by clicking on each item to change their name, price and quantity

### Quick Sale Buttons ###
* go to settings quick sale buttons and set your quick sale tabs up
* each item is referenced from the catalog, so you must use items you have already created in the catalog
* you can have max 5 tabs

### Daily stats ###
* this is not the best but you can see your daily sale takings aggregates 
