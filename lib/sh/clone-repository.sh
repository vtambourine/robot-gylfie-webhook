#!/usr/bin/env bash

cloneUrl=$1
baseBranch=$2

if [ -d '.git' ]; then
	git fetch --prune
	git checkout --force origin/${baseBranch}
else
	git clone --branch $2 ${cloneUrl} .
fi;