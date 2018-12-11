---
layout: post
title: "Testing With Intent: Writing Quality Tests"
---

In section 1 we saw that testing (like so many things) is all about getting the
most return on investment. If you're taking the time to write and maintain a
comprehensive test suite, you should make sure your time is well spent. Often,
the standard of a test suite decides whether it will be maintained, built up,
and relied-upon.

In this post, we'll look at ways to make sure your test-suite stays top-notch.
That your teammates find it useful instead of a drag. First we'll define
quality, with a clear vision of our aims, we can ensure we're winning. Then,
we'll look at test structure and naming, dependency management, and when to use
mocks. Finally we'll wrap up by talking about how to make sure your test suite
starts fast, and stays fast.

## Quantifying Quality

There is a natural analogy between tests and rock-climbing. Like pre-set hooks,
tests lay out a path. Well named, and well-structured tests are little messages
left by previous developers. Go this way! Look over here! They are also
safety-nets on your journey. Checkpoints, where you can lock-on and ensure you
never break essential functionality. The dual-nature of tests, as both a safety
net, and a trail of breadcrumbs from the developer before you, shows us the
essential principles we should expect.

1. Flexible

When you're refactoring is when the safety-net is most essential. If the tests
are too deeply coupled to your implementation, they will constantly be "in your
way". So, a top-notch test suite is as decoupled as possible from the specific
implementation. That way we are not tempted to move refactor and move our safety
net at the same time.

2. Reliable

Imagine that your safety-net drops you 5% of the time, or on Feb 29, or whenever
daylight-savings-time comes into effect. You would *never* rely on that for real
peace of mind. Just like in a CI pipeline, the damage done by flakey tests is
difficult to overestimate. Or maybe the test suite takes too long to run. This
is like a safety-net too far away. It's still there, but you're less willing to
rely on it.

3. Understandable

While climbing, the path you are on ends without warning. Maybe it veers wildly
off to the side, or the hooks are too far apart to be seen. Suddenly you are not
on a route. You are off by yourself. Of course, the climb may continue, but you
no longer have a guide. A test suite should be an understandable route-map, left
behind to guide the next developer through your though-process. What constraints
are on the system? What is the required behaviour? What are the things we *don't
care about*?

Like almost anything, most of these principles come with intentional directed
practice. Thoughtful introspection when writing tests (and code) will help us
improve over time. But, let's look at some ways we can improve our tests
*immediately*.

## Arrange, Act, Assert

The first, and simplest, way to improve understandability is to have structure.
Almost all tests can be broken down into 3 "stages". First, we arrange our
system and test data. Second, we act upon the system. Finally, we assert that
the outcome was what we expected. In a real test that would look like:

```Go
func TestReverse(t *testing.T) {
  // Arrange
  input := "abc"

  // Act
  result := Reverse(input)

  // Assert
  assert.Equal("cba", result)
}
```

In this case, the arrange step is just defining our input. The act step is
simply calling our pure function. The assert step is an equality check on the
output.

## Unrelated assertions

Importantly, it's not: arrange, act, assert, act, assert, etc. Each test should
(ideally) have a single action. When you have many actions and assertions in a
single test it becomes much more difficult to determine the * point * of the
test. For example, this test is actually two separate tests, combined into one.

```Go
func TestLoggedInUsersCanTweet(t *testing.T) {
  // Arrange
  server := NewServer()
  user := NewUser()
  
  // Act
  server.LoginUser(user)
  // Act (again)
  server.Tweet(user, "hello, world!")

  // Assert
  assert.Equal(user.Tweets(), []string{"hello, world!"})
  // Assert (something unrelated)
  assert.Equal(server.Uptime(), 1 * time.Minute)
}
```

What is the goal, property, or behaviour we are aiming to describe? This often
becomes an issue with end-to-end, or acceptance tests, where some login and user
setup is essential. If this is an issue, it is best to extract the login and
setup steps into helper functions. That helps keep the test purpose clear.

In this case, we could split this test into three separate tests and a helper,
each with a clear purpose:

```
func TestServerLaunches(t *testing.T) {
  // Arrange
  server := NewServer()
  
  // Act
  server.Launch()

  // Assert
  assert.Equal(server.Uptime(), 1 * time.Minute)
}

func TestUsersCanLogIn(t *testing.T) {
  // Arrange
  server := NewServer()
  user := NewUser()
  
  // Act
  server.LoginUser(user)

  // Assert
  assert.Equal(server.LoggedInuser(), user)
}

func TestLoggedInUsersCanTweet(t *testing.T) {
  // Arrange
  server := NewServer()
  user := NewLoggedInUser(server) // A setup-helper 
  
  // Act
  server.Tweet(user, "hello, world!")

  // Assert
  assert.Equal(user.Tweets(), []string{"hello, world!"})
}
```

This structure helps keep tests clear, tidy, and focused.

## Add a clue to the tests *intent* in the name

A test's name should have a clue towards the intent. Best if the test is named
specifically for the goal we are testing. For example, `TestUserCanPostTweets`
is a great test name. It is specific about the expected outcome. On the other
hand, `TestUserTweeterIsCorrect`, or `TestServerWorks` are both too vague too be
useful. What is "correct"? What does "works" mean in this context?

A helpful rule for naming tests is: subject, action, assertion. What is the
subject we are testing? What is the action we are taking? And what is the
expected outcome? If we have all three of these in the test name, we are on the
right track.

## Non-determinism

One issue which often causes unreliable tests is non-determinism in the
system-under-test.

If we want to apply a discount only on mondays, we could call `time.Now()`, look
at what day it is, and voila! Suppose I wrote this code on monday. Of course, I
can say, "Works on my machine!"

```Go
func TestApplyMondayDiscount(t *testing.T) {
  input := NewOrder()
  
  result := ApplyMondayDiscount(input)

  assert.Equal(result.Discount, 0.10)
}

func ApplyMondayDiscount(order Order) Order {
  if time.Now().Weekday() == time.Monday {
    return order.ApplyDiscount(0.10)
  }
  return order
}
```

But, these tests will start failing tomorrow. There are two ways to fix this
test (and code). Option one would be to use a mock clock. To inject a spy into
our test. But that avoids the real issue with the code. The underlying fault is
that our code has a hidden dependency. It depends on the global system clock.
Non-determinism is a symptom of impure functions, so we can fix it by making our
function pure. In this case, that means turning the secret state into an input.

```Go
func TestApplyMondayDiscount(t *testing.T) {
  now := time.Date(2018, 1, 21, 9, 0, 0, 0, time.UTC)
  input := NewOrder()
  
  result := ApplyMondayDiscount(now, input)

  assert.Equal(result.Discount, 0.10)
}

func ApplyMondayDiscount(now time.Time, order Order) Order {
  if now.Weekday() == time.Monday {
    return order.ApplyDiscount(0.10)
  }
  return order
}
```

Immediately, we find two more tests we should write: not-monday, and a different
timezone. In this case improving our test has also improved our code.

Non-determinism is really damaging if you leave it unchecked. False-negatives,
weaken the percieved usefulness of a test suite. A test suite which is "failing
when it shouldn't" is in dangerous territory. The bonus is, when you fix these
weird bugs you look like a hero!

In general, if you have non-deterministic (i.e. flakey) tests, it means you have
impure functions. Typically these come up with uses of sleep, randomness,
February (short month, and leap years), and with other globals and singletons.

## Dependencies

The sources of non-determinism, sleep and randomness, are just one instance of
an external dependency. But other dependencies, like databases, and external
APIs are easier to identify.

When testing with external dependencies, it's tempting to reach for a mock.
Maybe we could stub an http client with an http response like this:

```Go
func FetchAndSortTweets(client http.Client) {}

func TestTweetSorter(t *testing.T) {
  client := http.Client{}
  client.
    Stub(http.Get).
    With("https://api.twitter.com/api/v1/tweets").
    Returning(`{"tweets":[{"id":1}]}`)

  sorted := FetchAndSortTweets(client)
  ...
}
```

But, there's a rule to follow when testing external dependencies. Don't mock it
unless you own it. We don't "own" the twitter API. When the api changes, we'll
have to update all our tests.

To "own" the interface, we wrap and abstract the dependency behind an interface.

```Go
type TwitterClient interface {
  FetchTweets() []Tweet
}

func FetchAndSortTweets(client TwitterClient) {}

func TestTweetSorter(t *testing.T) {
  client := NewStubTwitterClient()
  client.
    Stub(client.FetchTweets).
    Returning([]Tweet\{\{ID: 1\}\})
  sorted := FetchAndSortTweets(client)
  ...
}
```

Here we've added a `TwitterClient` interface. Then we can safely stub that
interface to test against. This decouples our tests from the details of the
twitter api, and means we can write tests specifically for our Twitter client,
separately from the rest of our tests.

The same applies to other dependencies. Databases, and things like that. Some
libraries provide good interfaces already, so you don't have to do it yourself,
but not all.

##  Doubles / Stubs / Fakes / Mocks

Speaking of doubles, stubs, fakes, and mocks, what are they for?

Good uses can include:

- API Wrappers
- Around legacy code
- When absolutely necessary
- Things which are hard to set up (and you can't fix)

When used well, they can isolate tests from each other. When used poorly they
can couple the test to the code implementation, making refactoring harder, and
the test weaker. Worst of all, they can lead to unrealistic tests which don't
break when assumptions change. But, because mocks are simple your tests will
involve less code overall, so will run faster.

Because of these limitations, I prefer using as few mocks as possible. Just my
opinion.

## Why do tests get slow?

### Combinatorial Explosion

The number of tests and complexity always grows faster than your code. N
interacting bits of code will have up to N^2 connections. If you want to test
all interactions and combinations you need N^2 tests.

$$N Components = N^2\ Interactions$$

Firstly, this means you can't possibly test all combinations and interactions.
Secondly, it means that to test everything you would need far more tests than
the underlying code. Even if we *could* test everything the test suite would be
huge, unwieldy, and slow.

You'll know this is the cause, if your test suite is slow because you have *too
many* tests. Each individual test might be fast, but there are simply too many
of them. If each test involves too many (say 3 or more) "moving parts" each test
will be slower, and the number of test-cases will explode.

### Tests are too big

Like in the first one, the combinatorial explosion leads us into a familiar
trap. Test setup is painful and slow, so we start combining tests. We put a few
"related" assertions into one test. We start relying more and more on
integration tests.

Because there are too many components our tests become too high-level. But, more
important than the number of components is the amount of coupling between the
components. Are the interaction points clearly defined? Or are there so many
ways for one component to affect another that they are completely entangled?

One way of managing this is with a well chosen ratio of unit to integration
testing. Changing that ratio while maintaing quality of tests can push to design
changes. The general rule that gets quoted is 10x unit tests for every
integration test. Because integration tests involve more components, they will
run slower. To manage that we have fewer of them, just enough to test the
wiring, and rely more heavily on isolated unit tests. Of course, the ratios for
this depend on the project.

Combinatorial explosion can also be managed with mindful changes to the program
architecture. By being explicit about the components and interfaces between
them, the number of interaction-points and test cases can be tamed. Of the two
approaches, this is much harder, but also yields the biggest long-term gains.
