# Install

If you wish to use the ```npm start/stop/restart``` scripts then you'll need to install ```forever```:

```bash
sudo npm i -g forever
```

Then simply, 

```bash
npm i .
git submodule update --init
cp config.js.example config.(production|development).js
vim config.(production|development).js
```

# Run

```bash
node index
```

Or to run with ```forever```:

```bash
  npm start 
```

# Requires

* Cairo library (for captcha)
* Mongodb server
* Node v6+  (v8+ if using forever)

# Build status

The man he say..... [![Build Status](https://secure.travis-ci.org/pinittome/pinitto.me.png)](http://travis-ci.org/pinittome/pinitto.me)

# Todo

* Make it look purdy
* Realtime statistics
* More fine grained access controls
* We've got a board for planning, we'll share when we've done the above
