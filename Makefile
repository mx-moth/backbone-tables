# The default action. It depends upon the development action
# Change this to 'assets: production' if you want to compress everything as well
# as just compiling it as the default
assets: development


# Some definitions:
ROOT  := .
SRC   := $(ROOT)/src
DEST  := $(ROOT)/build



# Find all source files
SRC_FILES := $(shell find $(SRC) -type f | grep -vE 'Makefile|.git|.svn|.*.swp')
# Rename them in to destination files. This will be added to in the following sections
DEST_FILES := $(patsubst $(SRC)%,$(DEST)%,$(SRC_FILES))



# Compiling things

#Compile coffeescript files
DEST_FILES := $(DEST_FILES) $(patsubst %.coffee,%.js,$(filter %.coffee,$(DEST_FILES)))
%.js : %.coffee ; coffee -p -c $< > $@

#Compile less.css files
DEST_FILES := $(DEST_FILES) $(patsubst %.less,%.css,$(filter %.less,$(DEST_FILES)))
%.css : %.less  ; lessc $< > $@



# Compressing things

# Compressed files consist of the normal files, with the following substitutions:
COMPRESSED_FILES := $(DEST_FILES)

# .js files are compressed to .min.js, using the YUI compressor
COMPRESSED_FILES := $(patsubst %.js,%.min.js,$(COMPRESSED_FILES))
%.min.js : %.js ; $(YUI) $< --type js -o $@

# .css files are compressed to .min.css, using the YUI compressor
COMPRESSED_FILES := $(patsubst %.css,%.min.css,$(COMPRESSED_FILES))
%.min.css : %.css ; $(YUI) $< --type css -o $@

# YUI compressor command
YUI  := java -jar $(ROOT)/vendors/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar



# Misc stuff
# All the directories that need to be created. These are created first,
# so that compiles/compressed files have somewhere to go
# First we find them all
DIRS := $(patsubst $(SRC)%,$(DEST)%,$(shell find $(SRC) -type d | grep -vE '.git|.svn'))
# And then make a rule to create any directory
$(DIRS) : ; mkdir -p $@



# Copy source files to destination
$(DEST)/% : $(SRC)/% | $(DIRS) ; cp $< $@

# The two commands that can be run
development : $(DEST_FILES) | $(DIRS)
production  : development $(COMPRESSED_FILES) | $(DIRS)
clean : ; rm -R $(DEST)
watch : ; watch make $(filter-out watch,$(MAKECMDGOALS))



# These are actually commands. Ignore the fact that theses may actually be files as well
.PHONY: development production clean watch
