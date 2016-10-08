# Snackpack

Sensible configuration for Webpack.

Snackpack imports and merges configuration files, then passes them to webpack.

**snackpack is not stable, this documentation is quickly becoming out of date.**

The example project _is_ up to date.

When we start using it in production (soon) I'll kick off semver 1.0.0 and update the docs.

## Installation

`npm install --save-dev snackpack`

## Setup

snackpack.json

```json
{
  "environments": {
    "defaults": {
      "builders": [
        "babel",
        "jsx",
        "postcss",
        "pug",
        "html"
      ]
    },
    "production": {
      "builders": [
        "uglify"
      ]
    },
    "local": {
      "builders": [
        "webpack-dev-server"
      ]
    }
  }
}
```

##  Usage

copy this into your package.json:

```json
"scripts": {
  "build": "snackpack run production",
  "build:watch": "snackpack watch local",
  "serve": "snackpack serve local",
  "serve:production": "snackpack serve local production"
},
```

Local and production are environments, as specified in the manifest.

Notice how we can stack them: `snackpack serve local production`.

## Builders

You can write your own builders, and put them into `[your project]/config/snackpack/[builder]/[environment].js`.

You can also add your own configuration to existing builders the same way. Your config will be applied _after_ the default config.

The `defaults` environment will always be applied before any other environments.

##  The merge

When snackpack generates a webpack configuration file, it does so by deep-merging objects together in this order:

First, the defaults environment from every source:

* The defaults environment from the webpack builder
* The defaults environment from each builder specified in the project manifest
* config/snackpack/webpack/defaults.js
* config/snackpack/[each builder]/defaults.js

Then, for each environment passed into the snackpack command (in the order they're passed):

* That environment as exported by the webpack builder
* That environment as exported from each builder
* config/snackpack/webpack/[that environment].js
* config/snackpack/[each builder]/[that environment].js

### Uhhh

So, snackpack has its own defaults.

Then each builder has its own defaults.

Then your project can have some defaults

Then your project can have some defaults for each builder.

Then the same path for each environment specified.

Each builder ships with defaults that should just work for development and production, but your project always gets the final say if need be.
