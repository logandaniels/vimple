# vimple
A Safari extension that adds Vim-style keybindings.

This is a clone of extensions like Vimium and Vimari, created partially to add features that Vimari was lacking and partially to improve my knowledge of browser extensions and Javascript.

## Installation
Download and open [vimple.safariextz](https://github.com/logandaniels/vimple/raw/v1.0/vimple.safariextz).

Unfortunately, installing untrusted extensions is buggy in Safari. When you open the ``.safariextz`` file, Safari will ask you to confirm that you really want to install it. If you're lucky, clicking "Trust" will install the extension. Often, though, nothing will happen and you'll have to try opening the file multiple times or restart Safari before it installs. If you still can't get it to install, [this StackExchange answer](http://apple.stackexchange.com/questions/214760/force-installing-untrusted-safari-extensions/233701#233701) provides a (clunky) workaround.

## Current features
* Configurable key bindings
* Link hint navigation
* Insert mode for temporarily ignoring key bindings, e.g. while interacting with an HTML5 canvas
* URL blacklist for disabling extension on certain domains

## Available actions
* Open link in new tab or current tab
* Reload page
* Open tab, close tab
* Scroll up, scroll down
* Scroll to top or bottom of page
* Navigate back and forward in history
* Navigate between adjacent tabs
* Follow link labeled 'Next' or 'Previous'

## Future additions
* Regexp search on page?
