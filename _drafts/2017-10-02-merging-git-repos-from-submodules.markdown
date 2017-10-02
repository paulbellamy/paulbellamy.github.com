---
layout: post
title: Merging Git Repos from Submodules
---

{{ page.title }}
----------------

##### 02 October, 2017

Recently at work, we had 2 closely-related repositories. Because they
got built into a final binary, one (the website) was a submodule of
the other (main) repository. Initially this worked quite well, but we
began to find that the repositories would often change together. Or,
after changing the website you'd go into the main repository and do an
"update website" commit. A submodule was no longer the right choice
for us.

But, we'd built up quite a lot of history in both repos, and want to
save that.

The steps are:

1. Clear out the old submodule.

   First, we need to make sure our submodule is gone from the main
repository. Places to check are: `.gitmodules`, `.git/config`, and,
the entire submodule directory, in our case: `website/`.

2. Add the other repository as a second remote.

   From within the main repository, we run:

   ```
   git remote add website-repo git@github.com:paulbellamy/website.git
   ```

   With this we can do a `git fetch`, and get the branches from the
website repo.

3. Check out the master branch of the submodule repo, and move files
   to their final home.

   ```
   git checkout website-repo/master
   ```

    Now that we've checked out the website repo directly to the main
repo's root, we need to move the files into place. Luckily, I found a brilliant bit of
ls-tree magic ton [Rene Mayrhofer's Git cheat
sheet](https://www.mayrhofer.eu.org/git-cheat-sheet):

   ```
   git ls-tree -z --name-only HEAD | xargs -0 -I {} git mv {} website/
   git commit -m "Moved website to subdirectory"
   ```

   This one-liner will move all files in the repository into a
sub-directory. With that done, we can commit our newly moved files.

4. Merge the branches.

   When we checkout back to our master branch, we can, then carry out
the merge:

   ```
   git checkout origin/master
   git merge --allow-unrelated-histories website-repo/master
   ```

   Note, that we have to use the `--allow-unrelated-histories` flag,
otherwise git will complain that the two repos have very different
histories.

### Gotchas

There are a couple gotchas with this method, in particular be careful
with merge commits and Github. The merge commits in a repo contain the
issue number, so you can accidentally close the wrong issues when
pushing these commits to a new repository.

If you know of any other issues, please let me know!
