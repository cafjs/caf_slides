#!/bin/bash
#build app
pushd public
echo "browserify  -d js/main.js -o js/build.js"
browserify  -d js/main.js -o js/build.js &
pid1=$!
echo "browserify js/main.js | uglifyjs > js/build.min.js"
export NODE_ENV=production
browserify js/main.js | uglifyjs > js/build.min.js &
pid2=$!
unset NODE_ENV

#build user view
pushd user
echo "browserify  -d js/main.js -o js/build.js"
browserify  -d js/main.js -o js/build.js &
pid3=$!

echo "browserify js/main.js | uglifyjs > js/build.min.js"
export NODE_ENV=production
browserify js/main.js | uglifyjs > js/build.min.js &
pid4=$!

unset NODE_ENV
popd #user
popd #public


wait $pid1
wait $pid2
wait $pid3
wait $pid4
