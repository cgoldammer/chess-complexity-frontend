#!/bin/bash
set -e

echo "Starting deploy"

# Building the library
npm run test
npm run build

CURRENTDIR=~/code/chess-complexity-frontend
SERVEDIR=~/serve_content/chess-complexity-frontend

cd $CURRENTDIR
rm -rf $SERVEDIR
mkdir $SERVEDIR
cp -r $CURRENTDIR/lib $SERVEDIR/
