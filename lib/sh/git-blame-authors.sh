#!/usr/bin/env bash

files=$1

echo `for file in $files; do git blame -e --line-porcelain $file; done | grep ^author-mail | grep -o '[a-z0-9.-]\\+@[a-z0-9.-]\\+'| sort | uniq -c | sort -rn | awk '{print $2;}'`
