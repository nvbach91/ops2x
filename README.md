# Project home #
```
https://nvbach91@bitbucket.org/nvbach91/ops2x.git
```

# Latest updates #
```
```

# Quick start #
```
$ git clone https://nvbach91@bitbucket.org/nvbach91/ops2x.git
$ cd ./ops2x  # navigate to project root
$ npm install # install project dependencies
$ mongod      # open a new CMD and start mongod on localhost:27017
$ npm run dev # this will fire up the project.
              # gulp and nodemon must be installed globally with npm install -g gulp nodemon, see Build system setup
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
$ mongod --version # you might want to add MongoDB's bin directory to you system's PATH
```

* Instead of installing a local MongoDB you can connect to a remote server. 
* By default, the project assumes you choose to use a local MongoDB instance.
* You can change the configuration in file ``~/ops2x/config.js``

* navigate to project folder to continue
```
$ cd ~/ops2x
```

### Build system setup ###
* install these npm packages globally and only once
```
$ npm install -g gulp nodemon
```

* install local node module packages for our project
```
$ npm install
```

* Note: If you see red warnings regarding socket.io (don't freak out because you're not familiar with NodeJS) the project should still work and can be started, but if you want a clean installation with no errors and warnings, check [this solution](https://github.com/npm/npm/issues/9563#issuecomment-142666465)
* with Node.js version 6.2.2 and later, there should be no errors

### Mail service ###
* create a gmail account and enable less secure apps in gmail
* in file ``config.js`` replace it with your gmail account and password
* or you can leave it as-is and use my gmail account

### Database ###
* you can skip this part if you already have a MongoDB running somewhere
* configure default database path and run database service
```
$ mkdir C:/data/db/
$ mongod
```
* OR you can also specify a custom mongod path with
```
$ mongod --dbpath C:/path/to/your/database/directory/
```
* open mongo shell and create a database with the same name as in your config file
```
$ mongo
> use dev
```
* now you don't need to populate your database with data to start using, but for demonstration you can do
```
$ mongorestore --db dev dump/dev # note that this command restores a sample database called dev from the dump directory
                                 # if your database path is other than C:/data/db, you also need to use --dbpath C:/path/to/your/database/directory
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

## Deployment (on modulus hosting) ##
* go grab a free account on [Modulus](https://modulus.io)
* create a Node.js project and a MongoDB instance in your account
* install modulus with npm, follow the instructions on modulus
```
npm install -g modulus
```
* change the host and mongo uri in the ``config.js`` file
* type ``modulus login`` and provide modulus account credentials
* navigate to project root folder and type 
```
npm run build   #concat and build application scripts for deployment
modulus deploy  #deploy to modulus
```

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
* open you web browser (best Chrome)
* CTRL+P to open print dialog and set printer to the thermal printer
* change margins to none and you're good to go

### Barcode scanner setup ###
* plug you bar code scanner to a free USB port and that's it

### Accounts ###
* register an account in the web app
* login with that account
* go to settings and create a new employee
* if more than one person work with the POS then employees will be required to login

### Sale ###
* use you keyboard to enter prices, you can use Numpad to use price input directly, then use sale group buttons to add it to checkout
* use virtual keyboard (touch screen) to enter prices, then use sale group buttons to add it to checkout
* use quick sale buttons to instantly register a common item in quick sale tabs
* use barcode scanner to instantly register an item from the catalog
* once done registering click on Pay (or hit SPACE) and then enter the amount tendered and click DONE (or hit SPACE) or click Print first then click DONE

### Catalog ###
* go to settings and open Edit PLU
* now you can import a plaintext CSV file, use export to get an example of the file format
* you can use the search button to look for codes, existing codes are highlighted blue, and non-existing codes are highlighted green

### Checkout ###
* you can change the registered items in the checkout by clicking on each item to change their name, price and quantity

### Quick Sale Buttons ###
* go to settings quick sale buttons and create or delete your quick sale tabs 
* each quick sale item is referenced from the catalog, so you must use items you have already created in the catalog
* you can have max 5 tabs

### Daily stats ###
* this is not the best but you can see your daily sale takings aggregates

### Warehouse management ###
* this is still immature, only shows articles' balance in the warehouse

### Customer display setup ###
* the manual is on our development google drive

### Thermal Receipt Printer setup ###
* the manual is on our development google drive


