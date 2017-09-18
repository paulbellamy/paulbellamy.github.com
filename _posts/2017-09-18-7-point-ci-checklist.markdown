---
layout: post
title: 7-Point CI Checklist
---

{{ page.title }}
----------------

##### 18 September, 2017

Is setting up and maintaining CI really worth it for your project? Not
unless you're doing it right. Follow the CI checklist to see how yours
stacks up.

With these rules you'll be well on your way to CI bliss:

1. Fixing it must be a priority

   If you let your CI build languish while failing, it will quickly
become like that rotting month-old piece of meat in the back of the
fridge. No one wants it, but no one wants to touch it to throw it out.


2. Runs before and after every merge

   A Continuous Integration suite isn't much good if it isn't
*continuous*, is it! You shouldn't be merging failing code without a
good reason. But, just because two pull-requests passed independently,
doesn't mean they will both pass together, so you should run the CI
after merge as well.


3. Lint

   Often forgotten, linting is an important step in any CI pipeline. If
you want to enforce code styles (or check for common code bugs), CI is
the perfect place to do it.


4. Tests are reliable

   False-fails, or flakey tests will make people ignore your CI
altogether. When under pressure developers will just hit rebuild to
"re-roll the dice". No trust == no value.


5. Builds a reproducible release bundle

   One CI run, with some given input should == one output bundle. The
same one, every time. That means no using timestamps in your release
bundle. No using randomness when building your release bundle.
Everything needs to be deterministic. The big advantage here is that
you gain a high degree of certainty that the code you are running is
the code you wrote.


6. Release bundle can be linked back to originating code and build

   If your CI system does deployment, you should be able to tie back the
code which is running (or was running at any given time), to the CI
build which produced it. If you can't, you really shouldn't have any
confidence that what you're running in production is actually what you
think.


7. Notifies people when it breaks

   Last but not least, your CI build must notify someone when it breaks.
It shouldn't spam everyone incessantly, especially if you still have
flakey, unreliable tests. That will cause people to tune it out and
ignore failures. Getting the right notification level is a balance.
Ideally it should only notify the person who last pushed (odds are
they broke the build). But the status should be visible passively
before doing a deployment.

