#!/usr/bin/env rake
# Copyright 2012 Carlos Mondragon. All Rights Reserved.
#
# Rakefile to build, test and lint the solitaire game.
closure_dir  = "#{Dir.pwd}/vendor/closure-library"
tools_dir    = "#{closure_dir}/closure/bin/build"
compiler_dir = "#{Dir.pwd}/vendor/closure-compiler"

namespace :setup do
  desc 'Runs a full setup'
  task :full => [:git_submodules, :install_compiler]

  desc 'Inits git submodules and pulls them'
  task :git_submodules do
    `git submodule init && git submodule update`
  end

  desc 'Checks existance downloads and extracts Closure Compiler'
  task :install_compiler do
    next if File.exists? compiler_dir
    `mkdir #{compiler_dir}`
    url = 'http://dl.google.com/closure-compiler/compiler-latest.tar.gz'
    `wget #{url} --output-document=vendor/compiler.tar.gz`
    `tar -zxvf vendor/compiler.tar.gz -C #{compiler_dir}`
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

  desc 'Writes closure dependencies'
  task :deps do
    `python #{tools_dir}depswriter.py \
    --root_with_prefix="#{Dir.pwd} ../" \
    --output_file=src/solitario/deps.js`
  end

  desc 'Compiles the game'
  task :compile do
    `python #{tools_dir}/closurebuilder.py \
    --root=#{closure_dir} \
    --root=#{Dir.pwd}/src/ \
    --input=#{Dir.pwd}/src/solitario/app.js \
    --output_mode=compiled \
    --compiler_jar=#{compiler_dir}/compiler.jar \
    --compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS \
    --output_file=#{Dir.pwd}/build/js/app.compiled.js
    `
  end
end
