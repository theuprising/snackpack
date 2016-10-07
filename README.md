# Snackpack

Sensible configuration for Webpack.

Snackpack imports and merges configuration files, then passes them to webpack.

**snackpack is not stable, this documentation is quickly becoming out of date.**

The example project _is_ up to date.

When we start using it in production (soon) I'll kick off semver 1.0.0 and update the docs.

## Environments

Snackpack has a notion of environments. Built in Snackpack modules use the environments `local`, `development`, and `production`, and `defaults`. Your projects can define their own environments, like `heroku`.

##  Builders

Your project declares a list of builders, like `js`, or `postcss`.

A builder exports webpack configuration data for some environments.

The webpack builder is automatically included in every project, before other builders.

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

## Installation

`npm install --save-dev snackpack`

## Setup

Snackpack

##  Usage

`./node_modules/.bin/snackpack local development`

(Local and development are environments)
