# Copyright 2012 Ofir Picazo. All Rights Reserved.
#
# Makefile to build, test and lint the solitaire game.

CLOSURE_COMPILER_BIN = /Users/ofirp/bin/closure-compiler.jar
CLOSURE_LIB_DIR = /Users/ofirp/src/closure-library/
CLOSURE_TOOLS_DIR = $(CLOSURE_LIB_DIR)closure/bin/build/

all: css deps compile

compile:
	$(CLOSURE_TOOLS_DIR)closurebuilder.py \
	  --root=$(CLOSURE_LIB_DIR) \
	  --root=$(abspath src/) \
	  --input=$(abspath src/solitario/app.js) \
	  --output_mode=compiled \
	  --compiler_jar=$(CLOSURE_COMPILER_BIN) \
	  --compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS \
	  --output_file=$(abspath js/app.compiled.js)

deps:
	$(CLOSURE_TOOLS_DIR)depswriter.py \
	  --root_with_prefix="$(abspath src/) ../" \
	  --output_file=$(abspath src/solitario/deps.js)

lint:
	/usr/local/bin/gjslint -r $(abspath src/solitario)

css:
	compass compile $(abspath .) \
	  --css-dir="css" \
	  --javascripts-dir="js" \
	  --images-dir="images" \
	  --sass-dir="src/sass" \
	  --fonts-dir="fonts" \
	  --force \
	  --relative-assets \
	  --output-style=expanded

.PHONY: compile deps lint css
