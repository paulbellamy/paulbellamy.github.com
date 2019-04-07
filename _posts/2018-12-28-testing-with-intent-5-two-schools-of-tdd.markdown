---
title: "Testing With Intent: Two Schools of TDD"
---

There are 2 main styles you could divide TDD into. Both have advantages and
disadvantages.

- Detroit
- London

Both are agile, in that they both work "feature-by-feature", rather than
"layer-by-layer". Instead of implementing the entire "database layer", then the
entire "web layer", they work by implementing an entire feature at a time,
across all layers.

## Detroit

What we'll call "Detroit TDD" here could also be called, "Classical TDD".
Popularized by Kent Beck as part of Extreme Programming (XP), "Classical TDD" is
the source of the expression, "If an object is hard to test, then it is hard to
use."

Algorithm Triangulation is at the core of classical TDD. Like the GPS on your
cell-phone, it triangulates your position. As you add cell towers your position
gets more accurate. In classical TDD we add tests, and each test more clearly
specifies the algorithm we want, narrowing down the design space.

In this style, solutions tend to grow organically, through adding tests and
refactoring.

The process for writing code in this style is the well-known red-green-refactor:

1. Write a failing test
2. Change the implementation to make it pass
3. Refactor
4. GOTO 1

Because it is easier to start with smaller units of work, design in classical
TDD tends to be done "bottom-up". It is easier to start with smaller, specific
algoritms, then join them together. Starting bottom-up also pays off in testing.
By having the components available, when we come to write integration tests
there is less need to rely on test doubles. Our tests become more realistic
because we can use the actual components. Often in this style of tests you'll
see "object factories", helpers used to arrange complex dependency objects for a
test.

The refactor step is a big advantage of this style. We have a clear place for
refactoring in our workflow, and there is a focus on it.

One additional benefit is the focus on regression safety. Adding regression
tests to this workflow is simple and straightforward. The tests are not meant to
aid or impede your design workflow, simply as a safety net.

# London

While providing a nice safety net, Classical TDD falls short of helping us
actually design better programs. The book, "Growing Object-Oriented Software
Guided By Tests" (commonly abbreviated to: GOOS), introduces London-style TDD.
It was born from experience using TDD and XP on component-based distributed,
service-oriented applications prevalent in banks. Due to it's heavy use of mocks
and doubles, London-style TDD could also be called "Mockist".

In general, it is more object-oriented. In this style it is all about message
passing and interaction between components. As such, London TDD is a better fit
for distributed systems and microservices, than strict algorithmic computation.
It's all about defining the roles, responsibilities, and interactions within
your system.

Unlike classical TDD, London TDD would say that, "if a dependency is hard to
*mock*, then it is hard to use." The workflow involves much test doubles usage,
and design is oriented top-down.

1. Identify an entry-point and write a collaboration test for it
2. For each dependency the first collaboration test identifies:
    1. If it needs further breaking down, GOTO 1
    2. If it is a data transformation, write a pure function
    3. If it requires interacting with a third-party, write a wrapper

First, we immediately notice that, unlike Classical TDD's loop, London TDD is
recursive. Instead of building up a toolbox of small components, then piecing
them together, we are working "outside-in", starting with the entry-point to the
system and implementing inwards towards the details. Through this top-down
recursive design flow we identify the roles, responsibilities, key interactions,
and collaborations between roles in an end-to-end implementation of the
solution. This solution satisfies a system-level scenario or acceptance test.
Working inwards, we implement the code needed in each collaborator, one at a
time, faking it's direct collaborators and then working our way down through the
"call stack" of interactions until we have a working end-to-end implementation
that passes the front-end test.

But, what is a collaboration test? A collaboration test tests how 2+ components
collaborate to make a thing happen. Essentially it is testing the "wiring"
between other components. Excess (or tricky) mocking here can help find broken
encapsulation.

This top-down (or outside-in) design flow emphasizes clean, minimal designs and
pure functions. Pure functions make testing easier, and are the gateway drug to
functional programming. By starting with the external constraints, asking "what
does the program need to do", and working from that, we use tests to discover
the "right" code.

Mockist tests have more influence on the system design. However, because we are
writing the tests before all the collaborators exist, the tests will tend to use
more doubles. This can couple tests to the implementation and make them harder
to refactor. Because the design is somewhat self-describing it can feel rigid.
Some suggest localized-rewrites instead of refactoring. If you are trying to
change the tests and the code at the same time, it's like moving your safety-net
while still relying on it.

There's a great demo of this style at
[https://www.youtube.com/watch?v=tdNnN5yTIeM](https://www.youtube.com/watch?v=tdNnN5yTIeM).

## Which to use?

Ultimately, it depends on your project, and your work style.

Do you value ease of debugging? Mockist

Do you value ease of refactoring? Classical

Personally, I tend towards classical, but try to always work outside-in. I do a
depth-first implementation. Starting at the outside makes sure the finished
product satisfies the user story. It's not always possible. Sometimes big
problems need breaking down, and exploration is easier in a bottom-up workflow.

The primary benefit of Classical style is using fewer mocks. Not necessarily
"mock-free", but "mock-less". Mocks couple the test to the implementation, and
your tests end up reaching inside the implementation to setup internal state.
That makes refactoring harder, and I like to avoid thinking about the
implementation while writing tests. However, you will have a harder time finding
broken encapsulation. Classical style gives less guidance about program design.
But, importantly for morale, your tests are not red for as long. Because Mockist
is more recursive, you tend having a big stack of red tests before it all
collapses when you finish the feature.

### More Info

[Mocks Aren't Stubs - Martin Fowler](https://martinfowler.com/articles/mocksArentStubs.html)
