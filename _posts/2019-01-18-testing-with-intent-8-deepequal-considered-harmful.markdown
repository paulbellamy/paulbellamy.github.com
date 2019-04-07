---
title: "Testing With Intent: DeepEqual Considered Harmful"
---

## How DeepEqual Sneaks Into Tests

Deep equality testing often sneaks into api-level and integration tests. It is
easier to list a "known good" response, than it is to be explicit about the
assumptions and contract of an endpoint. It saves time, and as developers we're
always under time pressure. But at what cost?

## Brittle Tests

The first small issue begins when we come to add a feature. The database should
return a new field. We already have a test for the users being returned from the
database. Let's add the new field to the hardcoded test-data!

Oh no! All our tests using deep equality checking broke. Deep equality packages
up a whole load of assertions we may not intend. Not only are we asserting that
the data includes some fields, we're implicitly banning any deviation. Even if
that deviation is irrelevant to the test at hand.

## MegaTests

Test setup code sucks. When we're maintaining code and adding new features, it
is natural to avoid writing more than necessary. Combining this with
deep-equality based-tests, we add new fields and new features into the hardcoded
test inputs. Our tests add layer upon layer.

As the tests grow bigger, they engulf more of the system. More complexity. More
nuance. More subtlety. Instead of small focused tests, each checking a single
property, the test begin combining many, many assertions.

## Irrelevant Internals

When you do a deep-equality check, you're not asserting, "this response must
include a user." You're asserting, "this response must include *this* user, with
*these* specific fields, and *nothing else*." Regardless of whether the user
cares about those details, you've encoded them into the test. As the code's
requirements burrow under a mountain of incidental details, they become
overwhelmed by unrelated trivia. The code contract is obscured, forcing future
developers to decipher your code's intended contract by spelunking through the
tests.

In Go, this is even worse. Due to the inner-workings of Go's particular
`reflect.DeepEqual` package, you end up testing the irrelevant internals of your
package. Sooner or later you'll end up accidentally testing pointer-equality on
a field deep within the object you *actually* care about.

## DeepEqual is Never Enough

Eventually you'll hit a point where strict equality-checking isn't enough. For
example, pointers are being compared deep in the data-structure. A common
"solution" to this (in Go) is to implement your own DeepEqual. Now you have two
problems. Writing your actual test. Writing your DeepEqual implementation.
Testing your DeepEqual implementation. Writing and testing any dependent
DeepEqual implementations. Better hope you don't invalidate all your tests with
a mistake! Without even taking into account maintenance of your new DeepEqual
implementation, this is a giant can of worms.

## Solutions

Lots of the problems with deep equality-based tests are the shared with
hardcoded test-fixtures. A traditional solution is to use factories, or
generators, to cook up random data for each test. Then, in each test, you
override the specific pieces of test-data you care about. Factories help clarify
the code requirements and document the test's assertions. But, it doesnt help at
all with exponentially growing tests. Nor with the fragile, brittle nature of
maintaining your own DeepEqual implementation.

To get away from DeepEqual entirely, we should check the properties we care
about. By thinking about the client's expectations, and writing down the code's
requirements, we can document them for future developers. It is often better to
directly test the assertions, avoiding (as much as possible) adding accidental
requirements.

## Any Exceptions?

Ok, rant over. Back to the real world. When does using deep equality testing
make sense? At least in Go, there is one case where I still use it. Checking the
built-in datastructures, `array`, and `map`. Because they don't permit a direct
equality test, `reflect.DeepEqual` can be a useful shortcut. While this case is
go specific, I'd be suprised if there aren't parallels in other languages.
