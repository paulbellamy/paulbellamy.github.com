---
layout: post
title: Dotfiles &lt;3 Dropbox
---

{{ page.title }}
----------------

##### 20 February, 2011


Like a lot of devs I'm addicted to Dropbox.  It's a fantastic tool.  I've taken to storing all my dotfiles (.zshrc, .gitconfig, .vimrc, etc) in Dropbox.

It's fantastically useful, and keeps them synced across all your computers, effortlessly.  Instead of copying them from your dropbox, it is important to symlink the files into the appropriate locations.

For extra win, I've also begun storing all my dotfiles in a git repository.  This is excellent because if I mess up a config file I can just check it out again.

I've uploaded my dotfiles repository to github [here.](http://github.com/paulbellamy/dotfiles)

It includes an install script to symlink all the files to the appropriate locations.

Enjoy!
