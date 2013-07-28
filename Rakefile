#!/usr/bin/env rake
# Copyright 2012 Carlos Mondragon. All Rights Reserved.
#
# Rakefile to build, test and lint the solitaire game.

namespace :setup do
  desc 'Runs a full setup'
  task :full => [:git_submodules, :install_compiler]

  desc 'Inits git submodules and pulls them'
  task :git_submodules do
    `git submodule init && git submodule update`
  end

  desc 'Checks existance downloads and extracts Closure Compiler'
  task :install_compiler do
    next if File.exists? 'vendor/closure-compiler'
    `mkdir vendor/closure-compiler`
    url = 'http://dl.google.com/closure-compiler/compiler-latest.tar.gz'
    `wget #{url} --output-document=vendor/compiler.tar.gz`
    `tar -zxvf vendor/compiler.tar.gz -C vendor/closure-compiler`
    `rm vendor/compiler.tar.gz`
  end
end

namespace :build do
  desc 'Compiles the CSS!'
  task :css do
	`compass compile \
	  --css-dir="build/css" \
	  --javascripts-dir="js" \
	  --images-dir="static/images" \
	  --sass-dir="src/sass" \
	  --fonts-dir="static/fonts" \
	  --force \
	  --relative-assets \
	  --output-style=expanded`
  end
end
