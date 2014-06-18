# Install
* Clone the repo.
* run *git submodule init* and *git submodule update*
* run *npm install*
* create a *config.production.js* in the pinitto.me folder. Use the content of the existing *config.example.js*. 


__Always use the latest tagged version of pinitto.me for smooth sailing...__

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
** On Debian/Ubuntu do this using ```apt-get install libcairo2-dev libjpeg-dev libgif-dev```
* Mongodb server
* Node v6+  (v8+ if using forever)

# Build status

The man he say..... [![Build Status](https://secure.travis-ci.org/pinittome/pinitto.me.png)](http://travis-ci.org/pinittome/pinitto.me)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/pinittome/pinitto.me/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

