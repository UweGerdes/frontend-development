# Gulp for frontend development

Some operations on our source files have to be done: LESS styling must be translated to CSS, JavaScript files should be checked for syntax errors, Markdown files should be translated to HTML, tests have to run. To automate those tasks [Gulp.js](http://gulpjs.com/) is my choice.

Read the documentation to understand the concepts if you want to change the gulpfile.js to fit your needs.

You should also have a look at [Grunt](http://gruntjs.com/) which uses another approach. And if you think of Make, Ant, Maven or Gradle you have others with a similar aim. Integrated development environments and continous integration systems use those tools to assist you. But the configuration is a bit tricky sometimes. I like the fact that my environment depends on a few simple text files.

# Installation

You need Node.JS on your system.

[Gulp.js](http://gulpjs.com/) is installed globally on your system with `npm install -g gulp` - you might need administator right here.

To use the gulpfile.js you have to install the required node modules with: `npm install`.

If you want to use Graphviz please install it on your system.

# Usage

Now you should start `gulp` and the default task starts a build and and the watch task for my development environment.

