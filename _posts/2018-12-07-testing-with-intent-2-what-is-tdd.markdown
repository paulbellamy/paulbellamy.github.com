---
layout: post
title: "Testing With Intent: What is TDD?"
subtitle: And why should I care?
---

#### Everyone Already Tests

You already test. Even if you don't "do TDD". Even if it is clicking around the app, scouring for changes, checking your work. Or, you have a QA team that does that for you.

Even if you *don't* do that much testing yourself, you are still testing your software. You're relying on the users to do it for you. In production. Everyone tests in production. Some people are lucky enough to do it before production, too.

TDD is not *only* testing, it's how you can get the most return for your investment. With a mature testing practice we recognise that both testing too much, too little carry a cost. Too much, and you spend all your time writing and maintaining test code. Too little, and you miss crucial bugs, making your customers angry.

Automated testing is by far the most efficient way to do testing. We can run them often, for immediate feedback as we code. But, to be effective, the tests must express the developer's *intent*.

TDD implies a very specific workflow, called Red-Green-Refactor. And in this post we'll discuss why that workflow is so important.

#### Design by wishful thinking

Several people have described TDD as "design by wishful thinking". We begin the coding process by imagining how we would like to *use* our code. For the whole system that means how the end user will interact with our program. For a hair-raising subsystem, asking what function-signature or API this code exposes?

Writing the tests first forces us to examine the benefits and constraints of the system. This up-front design consideration can improve our API designs. If a system is difficult to test, it is difficult to use.

We could do all this design-thinking in much simpler ways, by writing our spec in a document, or even a UML model. But, by embodying our design in a series of tests we get far more benefit. Our design can then live on, to verify the *actual* implementation.

More than, "design by wishful thinking", TDD is:

> Design by writing tests for code
> which doesn't exist.

Each test constrains the design space, moulding and pushing the code into the shape we want.

#### #TestingGoals

When testing, we have 3 primary goals:

- Preventing Bugs
- Preventing Fear
- Improving Design

Preventing bugs with regression testing is great. It is far better to prevent bugs by make APIS more explicit.

Testing can help us reduce the fear of "touching someone else's code". This fear is always somewhat present when refactoring. The ever-dreaded, "what have I missed?" feeling. A thorough, comprehensive test suite can help ease that fear, enabling fearless refactoring. By "comprehensive", I don't mean 100% code-coverage. I mean that the tests make the assumptions explicit. They encode all the requirements the developer expects.

Improving design is, as always, a more subtle topic. But in general, if a system is difficult to test, it is difficult to use. The sooner we discover that, the less expensive it is to *fix* the design.

TDD delivers these goals with three simple rules.

#### 3 Rules

1. Don't write production code unless it to passes a failing test

    The first rule makes sure you have 100% coverage (or at least high). If you write code that's without a test, it *must* be untested. In all honesty, this is the rule most people (including myself) cheat on. Perfectionist 100% test coverage is not common, or even necessary for every project. There is a scale from 0% tested, to 100% tested (and beyond). Determining where you should be, demands honesty. Honesty about your product, your customers, and your industry.

2. Write only enough of a test to show a failure

    The second rule counter-balances the first. If you're writing more test than you need to show a failure that's a waste. You write tests with code. Code needs maintenance. Too many tests, means wasted time maintaining tests!

    But, failing to compile counts as a failure. Often the first test can only involve calling a function, or using an interface. That will fail to compile, and we can go begin work.

3. Write only enough production code to pass the test

    Rule three comes full-circle back to number one. We're not writing code without a failing test. So once the tests pass, it's time to go back and write the next failing test.

These three rules work together to ensure we are always hopping back and forth. We develop the tests and the code in parallel. Little bit of test. Little bit of code. Through this process, we keep iterations frequent.

Because we are always running our tests, any introduced bugs are easy to find. Our tests passed a few minutes ago, so the bug *must* have been crept in in the last few minutes. This means that when we're following TDD, we can actually spend *less* time debugging.

#### Feedback Loop

This test/code/test/code/etc feedback loop is super-important, and really makes up the heart of TDD. We want it to happen quickly and frequently. It's so important it even has a special name:

> Red => Green => Refactor

Or, as a colleague of mine would say, "if you're colour-blind it is brown-brown-refactor".

When we get in the "flow" of TDD, red-green-refactor leads us to a natural workflow. Little bit of test. Little bit of code. Little bit of refactor (if needed). Skipping steps in this feedback loop is tempting, but each one is important. Writing a test and *watching it fail*, is how we verify that the test actually works. It is far too easy to write a buggy test which always passes. The red step helps us prevent that. The green step is writing the code. And the refactor step helps us leave the codebase nicer than we found it.

Refactoring has a clear place in this workflow. As we're developing we are always testing, *and* we are always refactoring. This means we're not doing big-bang cleanup/refactor steps. We're cleaning up little and often. We're always leaving the codebase better than we found it. Refactoring becomes focussed on the area you're working in. If you work on an area a lot, you end up refactoring it a lot.

#### Why Testing?

Unfortunately, real-world software engineering studies are difficult to find, and hard to replicate. But, Microsoft Research has done interesting research into TDD's costs and benefits. When studying this they found that:

> [...] the TDD projects had roughly a 60% decrease in defect density and took about 25% longer [to write].
-- Hillel Wayne, ref. a study by Dr. Nagappan, Microsoft Research

The actual range was a 40-90% defect decrease, with a 15-35% increase in initial development time. A huge range, but definitely indicates that there is something worth pursuing. Unfortunately, the study didn't measure maintenance impact.

Studying software is hard. There are not a lot of good studies, but it is safe to say that TDD works. But, we would have to add a caveat for the size and lifetime of the project. A big, long-lived project will benefit more from thorough testing. While a one-off, ten-minute job may not. But, that applies to having tests at all, not only TDD.

Of course there is a balance between, "move fast and break things", and taking your time to do it right. Testing is a question of short-term optimisation or long-term optimisation. Less code is better, and tests are code. But, some code is more important than other code? We can see the following four statements are true:

1. Some code contains bugs
2. Bugs are dangerous
3. We can't predict which code contains bugs
4. So we must reduce the number of lines of code

Some bugs are more dangerous than others. Bugs in tests are much less dangerous than bugs in production code. If we can offload bugs from our production code to tests, we win! Also, tests should be simpler than the code they are testing.

##### Why TDD?

So, if TDD is more specific than testing, why isn't it enough to write tests after? Most engineers would argue that testing after is *easier*. And, indeed a study by Fucci et. al confirmed that:

> [...] there was no difference between writing the tests before a chunk of code and writing them after.
-- Hillel Wayne, ref. a study by Fucci et. al

But, the important argument for TDD came from George and Williams, where they found, that:

> [...] TDD developers took more time (16%) than control group developers. However, [...] the control group pairs did not primarily write any worthwhile automated test cases (though they were instructed to do so) [...]
-- George and Williams

So, while testing afterwards *is* as good, you won't do it. And that completely agrees with my own experience. As a developer I'm always under time-pressure. I always want to move onto the next project. And I've already written the code! I know it works! I wrote it! When writing tests after the code you take shortcuts. Because the code already exists the tests can't guide the design of the code. If something is difficult to test, that's how it is. Or more likely, you'll skip the difficult tests.

Red-Green-Refactor is about more than more than making sure we write tests. It makes sure that we reduce the total amount of code to maintain by refactoring. To make sure there's less of *everything*, refactoring must include prod code *and* tests.
