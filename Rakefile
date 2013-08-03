#!/usr/bin/env rake
# Copyright 2013 Carlos Mondragon and Ofir Picazo. All Rights Reserved.
#
# Rakefile to build, test and lint the solitaire game.
closure_dir  = "#{Dir.pwd}/vendor/closure-library"
tools_dir    = "#{closure_dir}/closure/bin/build"
compiler_dir = "#{Dir.pwd}/vendor/closure-compiler"
compiler_url = "http://dl.google.com/closure-compiler/compiler-latest.tar.gz"
linter_url = "http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz"

# Setup tasks, normally only run once.
namespace :setup do
  desc "Inits git submodules and pulls them"
  task :git_submodules do
    title "Fetching git submodules"
    system("git submodule init && git submodule update") or exit!(1)
  end

  desc "Checks existance, downloads and extracts Closure Compiler"
  task :install_compiler do
    next if File.exists? compiler_dir
    title "Installing Closure Compiler..."
    system("mkdir #{compiler_dir}") or exit!(1)
    system("curl --progress-bar -o vendor/compiler.tar.gz #{compiler_url}") or exit!(1)
    system("tar -zxvf vendor/compiler.tar.gz -C #{compiler_dir}") or exit!(1)
    system("rm vendor/compiler.tar.gz") or exit!(1)
  end

  desc "Installs Closure Linter if not installed"
  task :install_linter do
    if !system("which gjslint > /dev/null 2>&1")
      title "Installing Closure Linter..."
      system("sudo easy_install #{linter_url} 2>&1") or exit!(1)
    end
  end
end

desc "Runs a full setup"
task :setup => ["setup:git_submodules", "setup:install_compiler",
                "setup:install_linter"]

# Build tasks used in dev and deploy.
desc "Runs JSLinter"
task :linter do
  title "Running JSLinter"
  system("gjslint -r #{Dir.pwd}/src/solitario --strict") or exit!(1)
end

desc "Clean the previous build"
task :clean do
  title "Cleaning previous build"
  system("rm -rf #{Dir.pwd}/build") or exit!(1)
  system("mkdir -p #{Dir.pwd}/build/js") or exit!(1)
end

desc "Writes closure dependencies"
task :deps do
  title "Writing Closure dependencies"
  system("python #{tools_dir}/depswriter.py \
          --root_with_prefix='#{Dir.pwd}/src/solitario ../solitario' \
          --output_file=src/solitario/deps.js") or exit!(1)
end

desc "Copy static files"
task :static_files do
  title "Copying static files"
  system("cp -r #{Dir.pwd}/static/ #{Dir.pwd}/build/") or exit!(1)
end

# Tasks only for dev.
namespace :dev do
  desc "Compiles the CSS"
  task :css do
    title "Compiling CSS"
    system("compass compile \
      --css-dir='build/css' \
      --javascripts-dir='build/js' \
      --images-dir='build/images' \
      --sass-dir='src/sass' \
      --fonts-dir='build/fonts' \
      --force \
      --relative-assets \
      --output-style=expanded") or exit!(1)
  end

  desc "Creates symlinks needed for development"
  task :js do
    title "Creating JS symlinks"
    system("ln -s #{closure_dir}/closure/goog #{Dir.pwd}/build/js/goog") or exit!(1)
    system("ln -s #{Dir.pwd}/src/solitario #{Dir.pwd}/build/js/solitario") or exit!(1)
  end
end

# Tasks only for deploy.
namespace :deploy do
  desc "Compiles the CSS"
  task :css do
    title "Compiling CSS"
    system("compass compile \
      --css-dir='build/css' \
      --javascripts-dir='build/js' \
      --images-dir='build/images' \
      --sass-dir='src/sass' \
      --fonts-dir='build/fonts' \
      --force \
      --relative-assets \
      --output-style=compressed") or exit!(1)
  end

  desc "Compiles the JavaScript of the game"
  task :js do
    title "Compiling JS"
    system("python #{tools_dir}/closurebuilder.py \
           --root=#{closure_dir} \
           --root=#{Dir.pwd}/src/ \
           --input=#{Dir.pwd}/src/solitario/app.js \
           --output_mode=compiled \
           --compiler_jar=#{compiler_dir}/compiler.jar \
           --compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS \
           --output_file=#{Dir.pwd}/build/js/app.compiled.js") or exit!(1)
  end
end

desc "Build the project for development"
task :dev => [:linter, :clean, :static_files, :deps, "dev:css", "dev:js"]

desc "Build the project for deployment"
task :deploy => [:linter, :clean, :static_files, :deps, "deploy:css",
                 "deploy:js"]

def title(text)
  puts "\e[1;36m#{text}\e[0m"
end
