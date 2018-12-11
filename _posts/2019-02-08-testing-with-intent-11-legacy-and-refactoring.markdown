---
layout: post
title: "Testing With Intent: Legacy and Refactoring"
---

## Bringing TDD Into an existing organization

Beginning a testing practice in an existing organization is much harder than
starting it on a fresh project. TDD even more-so. When there is already inertia,
and outside pressure, changing course takes a long time. But, once that inertia
is in the right direction, it will be unstoppable.

Where to begin? There are three different approaches. Depending on your
organization, each can make sense. They are:

- Katas - Mindful practice

  One option is to run a session or two. Start encouraging your team to get
  familiar with it. This is the most gentle starting point. It lets people
  practice and get comfortable with testing on their own terms. But, it can
  backfire when there is no "motivating factor". The ideas and practice can seem
  irrelivant to "real work". It can be difficult to carve a schedule for this
  practice. There is always more work to do, and everyone is already busy.

- Greenfield - New project

  Bring in TDD fresh on a new project. This is a great approach if you
  have new projects. But, it can be bewildering. You are straight in the deep
  end. It can be overwhelming to combine a new project, with new testing. In the
  beginning it is important to take it slow.

- Brownfield - Fixing up legacy

  Use tests to help you fix up a legacy system. For this you can create a
  "Golden Standard" of how the program should act. Brownfield projects require
  less "buy-in". You can say "it was useful to me". But, it's much harder.
  Testing an existing system is the most difficult way to begin. And, "Golden
  Standard" testing uses high-level integration testing extensively. That can
  make these tests slow, and difficult to maintain. Typically they also start
  out in a separate repository. This is a recipe for disaster, as the
  integration tests will be neglected and forgotten about. If they are too slow
  to run locally they will only run on CI, feeling like a burden to the
  developers. If they are in a separate repo, they will be out-of-sight and
  out-of-mind.

Whichever approach you choose, you'll end up creating little "pockets of TDD"
within the bigger system. When working on new components, define their
boundaries within the bigger system, and TDD the new component.

## Testing legacy systems

When testing legacy systems, there are three key steps to go through.

- "Gold Standard" approach

  First is defining the existing known behaviour and requirements. This gives us a
  safety-net to work within. Starting from the outside-in, like this, is a big
  project. It is best to do it incrementally.

- Testing the boundaries

  Once we have the safety net, we can begin defining and testing the boundaries
  within the system. When we find the boundaries we can add tests for them. As
  we upgrade, refactor, and replace components of the system the test suite will
  become more complete.

- Finding the right balance of specificity

  Finally, as we work through the system we'll find the right balance of
  specifity when testing. In an established test suite there will be a balance
  between integration tests and unit tests. On a legacy project those balances
  haven't yet been found. If your acceptance tests are too fine-grained the
  suite will be slow. That's fine as a starting point. So do big system tests,
  and pull pieces out to unit test.

Any time you're working on a legacy system it is important to pick and choose
your battles. Is the system critical? Does the system break? How often? Are we
working on/replacing it? The answers to these questions will help you decide if
this work is worth doing.

## Cultural Shift

Testing demands a cultural shift. It requires acknowledging that there will
always be outside pressure to ship faster. To "move fast and break things".
To skip and bodge the solution "for now". Instead, we need to purposefully focus
on "getting it right".

If  we're choosing to bodge solutions "for now" and to skimp on quality, we
should be honest about that. Sometimes it's ok. After all, the company doesn't
exist to write tests. But, we need to excercise extreme caution that this
doesn't become the new normal.

> Slow is smooth, smooth is fast.

If we slow down, and get it "right" the first time, we won't have to keep
revisiting the same thing. If we don't have time to do it right, we don't have
time to do it. It's about prioritizing doing a few things well over doing
everything badly. 

## More Reading

There's a lot more great information about working with legacy systems in the
book: "Working Effectively with Legacy Code" by Michael Feathers. If you have a
big system to manage, I'd abhor you to read that.
