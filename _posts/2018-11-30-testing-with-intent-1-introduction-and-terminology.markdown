---
layout: post
title: "Testing With Intent: Introduction and Terminology"
---

With this series, I aim to showcase how we can write tests which serve as executable documentation. Tests which embody the original developer's desires for the code. Tests which verify customer requirements quickly and efficiently before every release.

---

## Table of Contents

1. [Introduction and Terminology](#introduction)
2. [What is TDD? And why should I care?]({% post_url 2018-12-07-testing-with-intent-2-what-is-tdd %})
<h4 style="margin-bottom: 0; margin-top: 24px;">Upcoming Posts...</h4>
<div><span>14 Dec 2018</span> &raquo; Writing Quality Tests</div>
<div><span>21 Dec 2018</span> &raquo; Testing as Triangulation</div>
<div><span>28 Dec 2018</span> &raquo; Two Schools of TDD</div>
<div><span>04 Jan 2019</span> &raquo; Testing and Types</div>
<div><span>11 Jan 2019</span> &raquo; TDD's Impact on Program Design</div>
<div><span>18 Jan 2019</span> &raquo; DeepEqual Considered Harmful</div>
<div><span>25 Jan 2019</span> &raquo; Descriptive Test Naming</div>
<div><span>01 Feb 2019</span> &raquo; Testing the Database with Interfaces</div>
<div><span>08 Feb 2019</span> &raquo; Legacy and Refactoring</div>
<br>

---

## Introduction

While working through several projects, helping teams improve their testing,
I've been ruminating on what makes for good tests. Some teams have enormous
success with automated testing. Others find it more burden than benefit, and
slowly abandon it. Or worse, they march on regardless. What are the differences?
And how can we make sure our teams testing soars?

Through this series, we'll be exploring these questions. Testing can be
contentious, and is often touted as a "silver-bullet". We must immediately shed
those notions. Everything is a tradeoff. While this series doesn't aim to be
TDD-specific. If you prefer to do tests after, or don't want to follow
red/green/refactor, this series should still prove useful. But, to understand
the tradeoff you're making, it's important to understand TDD's benefits and
challenges.

Regardless of your stance on TDD, success in testing depends on a willingness to
wear different hats. To put aside your coder hat, and put on your user hat. To
understand your software as a user would. Then, using that knowledge to
write high-quality rock-solid tests.

As you learn to listen to your tests, you'll see their impact on your code.
Tests can improve your codebase, and your software design. By making your code
easy to test, we can make it easy to use. But, sometimes that's not possible, so
we'll look at ways to test the really tricky bits of code, and work with legacy
infrastructure.

By the end of this series you should feel confident to truly understand the code
you're writing. To have a new safety-net when refactoring. And, to examine your
own deeply-held beliefs about testing and quality in software.

##  Terminology Reference

A lot of naming in testing is convoluted. People end up talking at cross-purposes. To help avoid that, let's start by defining some specific terminology. As the series progresses, I'll add more terminology here, so that this can become a useful reference.

### Unit / Integration / Acceptance Tests

A unit test, involves one single "unit". Whatever level you define that at.
Often a single piece of functionality on a class-level. In a unit test
everything else should be mocked, stubbed, or otherwise faked. When you break a
line of code one single unit test should break, pointing you to the exact issue.

Integration tests involve multiple communicating "units". However, these tests
do not involve any external or third-party dependencies. When you introduce a
bug, many integration tests may fail. Because they depend on shared pieces of
code (commonly login), one bug can ripple to many integration tests. This makes
them less useful for debugging. But, they are vitally important to test the
"wiring" between your unit-tested components.

Acceptance tests are the highest-level test. They involve multiple communicating
pieces, and as many external dependencies as possible. Commonly, acceptance
tests will launch test databases, and prepare temporary directories for
file-testing. Maybe your third-party APIs have sandboxes these tests can use.
Because they involve so many dependencies, these tests tend to be the least
reliable, and are run the least. But, they're also a vital sanity-check before
releasing code.

###  Doubles / Stubs / Fakes / Mocks

The naming of fakes, stubs, mocks, and spies are all very convoluted. Every test
framework uses them differently. For this series, I'll try to use the following
definitions.

- Double
  - Fakes
  - Stubs
    - Mocks
    - Spies

Double is the generic term, as in "stunt double". There are 2 main types of doubles. Fakes, which use an alternate implementation, and Stubs, which use pre-determined responses.

Good uses for doubles can include:

- API Wrappers
- Around legacy code
- When absolutely necessary
- Things which are hard to set up (and you can't fix)

#### Fakes

Fakes are quite useful for databases. If you're careful they mean you can swap in a real database (with the same interface) and run the same tests (giving you an end-to-end test). However, fakes make it harder to simulate errors (your in-memory database never has network latency).

An example of using a fake database:

```Go
type FakeDB struct {
  users map[string]User{}
}

func (d FakeDB) AddUser(id string, user User) { users[id] = user }
func (d FakeDB) GetUser(id string) User { return users[id] }

func TestShowingUsers(t *testing.T) {
  db := NewFakeDB()
  db.AddUser("paul", User{Email: "paul.a.bellamy@gmail.com"})
  email := Show("paul", db)
  ...
}
```

#### Stubs

Unlike fakes, stubs have no "real implemation". They always return a pre-determined value. Stubs help avoid building tricky or complicated fakes. Maybe there is not a good way to simulate some external dependency. Instead, we can simply provide the requests/responses we expect. In general, it is easier to test error conditions with stubs than with fakes.

If we are using `github.com/karlseguin/gofake`, a stub might look like:

```Go
func TestShowingUsers(t *testing.T) {
  db := NewStubDB()
  db.
    Stub(db.GetUser).
    Returning(User{Email: "user@email.com"})
  email := Show("paul", db)
  ...
}
```

Within stubs, there are two sub-categories. Mocks, and spies. A mock is generally a stub with some built-in assertions. For example, if we wanted to assert that our `db.GetUser` was called with a specific name, we could set an expectation on the stub:

```Go
func TestShowingUsers(t *testing.T) {
  db := NewMockDB()
  db.
    Expect(db.GetUser).
    With("paul").
    Returning(User{Email: "user@email.com"})
  email := Show("paul", db)
  ...
  db.Assert(t)
}
```

Spies are stubs which record the interactions. These can be useful if we want to
assert that a method was called. For example if we wanted to assert that the
`db.GetUser` method was called, we could use a spy:

```Go
func TestShowingUsers(t *testing.T) {
  db := NewSpyDB()
  db.
    Spy(db.GetUser).
    Returning(User{Email: "user@email.com"})
  email := Show("paul", db)
  ...
  assert.Equal(1, db.Called(db.Getuser))
}
```

### BDD, Behaviour Driven Design

BDD is a big topic, which we won't cover here.

In short, it fills the same role as integration tests. It is primarily a
change in the way we think about naming tests. A drive towards more "humane"
naming. Instead of describing what the code is doing, we describe what the user
is doing.

It's mostly useful for human-oriented systems. CLI, web-apps, that sort of thing. for APIs, and libraries it is harder to use.

The main goal is better communication across the business/development boundary.
If you have trouble there, maybe BDD is worth looking into.
