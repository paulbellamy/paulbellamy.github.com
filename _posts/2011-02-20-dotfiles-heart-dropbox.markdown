---
layout: post
title: Dotfiles &lt;3 Dropbox
---

Like a lot of devs I'm addicted to Dropbox.  It's a fantastic tool.  I've taken to storing all my dotfiles (.zshrc, .gitconfig, .vimrc, etc) in Dropbox.  It's fantastically useful, and keeps them synced across all your computers, effortlessly.  Instead of copying them from your dropbox, it is important to symlink the files into the appropriate locations.

For extra win, I've also begun storing all my dotfiles in a git repository.  This is excellent because if I mess up a config file I can just revert the mistaken changes.

I've uploaded my dotfiles repository to github [here.](http://github.com/paulbellamy/dotfiles)

It includes an install script to symlink all the files to the appropriate locations.

Some of the highlights include:

    # Shell Aliases from .zshrc and .bashrc
      # zsh for the most frequently used commands
      alias frequent='cat ~/.zsh_history | cut -d";" -f2 | cut -d" " -f1 | sort | uniq -c | sort -rn |  head'

      # And for bash
      alias frequent="cat ~/.bash_history | cut -d' ' -f1 | sort | uniq -c | sort -rn | head"

      # Change directories without using 'cd' in bash
      shopt -s autocd
      
      # Shortcut for 'ps aux | grep x'
      alias 'ps?'='ps aux | grep '

    # Git awesomeness from the .gitconfig
      # Show commits that exist in the current
      # branch, but not in the provided one. So,
      # for example to see what you've done in
      # your current branch, but not in master
      # (great for changelogs), do:
      #   git whatsnew master
      whatsnew = !sh -c 'git shortlog --format=\"%h %s\" $1..HEAD' -
    

There are a few more goodies in the .vimrc, but I will leave those for another post.  Enjoy!
