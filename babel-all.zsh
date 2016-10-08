#! /usr/bin/env zsh

for OLD in src/**/*.js ; do
  NEW=dist/`echo "$OLD" | cut -b 5-`
  mkdir -p `dirname $NEW`
  echo "transpiling $OLD"
  ./node_modules/.bin/babel $OLD > $NEW
done

