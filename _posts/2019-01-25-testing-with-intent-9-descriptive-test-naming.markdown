---
layout: post
title: "Testing With Intent: Descriptive Test Naming"
---

## Why Naming Matters

Naming is hard. Of course it is. But, if you're writing tests, you have to name
them. Why *not* make it a good name? One way to think of testing is "using test
code to describe what the implementation code does". The test name is "using
plain language to describe what the implementation code does". A third
description of what the implementation code should do.

Giving our test a descriptive name *is* more work up front, and feels redundant.
But, when the new developer abandons us to their botched refactor, we have
*three* descriptions of what the code *should* do. We have the test assertions.
We have the test name. And finally, we have the implementation code. If we only
had two descriptions, how would we tell which is correct? By having three
descriptions we can look at the two which agree, and figure it out.

##  What Makes A Good Test Name?

A descriptive test name is a description of the implementation, in plain
language. The test should express a single specific requirement. So the name
should also.

A descriptive test name should include the expected input, or setup state. It
should include the subject we are testing, or the action we are taking. And, it
should include the expected result. These three stages are identical to the
"Arrange/Act/Assert" trio from earlier. We can divide the test into three
sections. First, arranging the input and state. Second, performing some action.
Third, observing and testing the result.

It's not a coincidence that this pattern shows up again. These three stages are
what we need to specify some software's behaviour. By putting all three in our
test name, we can fully describe our expectations.

## Approaches

For these examples I'll be using an imaginary test framework, similar to
[Mocha](mochajs.org) for Javascript. Mocha provides string-based test names,
along with nested setup. However, I've changed a few of the Mocha function names
to smooth out the examples. Mocha is very similar to test frameworks in other
languages, such as RSpec in Ruby. If your testing framework uses function or
method names, then the naming examples will need converting.

### BDD-style Naming

Because BDD is all about communicating requirements between technical and
non-technical stakeholders, they tend to have a lot of structure. BDD-style test
naming is often broken down into 3 "stages". First, is the "Given" stage, where
we define our preconditions. Then the "When" stage, where we describe the action
we are taking. Finally, the "Then" stage where we state our expectations. These
stages are identical to the Arrange/Act/Assert trio we saw earlier in the
series.

For example:

```
Given I am logged in
When I save a new post
Then the new post will appear on my blog
```

Let's break this down.

- `Given I am logged in`

  Our arrangement. So, for this test setup we need to create a user, and log in
  as them.

- `When I save a new post`

  Our action. Write a new blog post, and save it.

- `Then the new post will appear on my blog`

  Our assertion. We should load the user's blog (or only the database query),
  and check the post has been saved.

Because the BDD-style test description starts from a user story, it is
immediately understandable to non-developers. Though, they will need some
familiarity with the software's domain. Imagine trying to write a fluid-dynamics
simulation test with no physics knowledge!

```js
given("I am logged in", function() {
  let user;
  beforeEach(function() {
    user = createAndLogin();
  })

  when("I save a new post", function() {
    let newPost;
    beforeEach(function() {
      newPost = saveNewPost();
    })

    then("the new post will appear on my blog", function() {
      const myPosts = loadMyPosts();
      assert(myPosts).contains(newPost);
    });
  });
});
```

Like in this example, these test descriptions work best for high-level,
end-to-end or integration tests. High-level tests often have lots of setup, so
frameworks like Mocha and RSpec with nested description-blocks are quite
helpful.

With a simpler testing package (like in Go), we could name this function:

```Go
func Test_LoggedIn_SaveNewPost_AppearsOnMyBlog(t *testing.T) {
  // Arrange
  var user = CreateAndLogin()

  // Act
  var post = SaveNewPost()

  // Assert
  var myPosts = LoadMyPosts()
  if !myPosts.Contains(post) {
    t.Errorf("Expected new post to appear on my blog")
  }
}
```

We still get the same descriptive test naming. But, if we have many test-cases
we will be forced to duplicate some test-setup.

### Property-Based Naming

While BDD-style testing works well for high-level features, and integration
tests, it is too onerous for isolated unit-tests. In that case, a much simpler
naming scheme is needed.

Part of the beauty of the BDD-style naming is that it mirrors our
Arrange/Act/Assert pattern. With Unit tests we can follow the same. But, instead
of using user-story-style phrases, we can be direct:

```js
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});
```

This test name (taken from the Mocha docs) clearly states that we're testing
`Array#indexOf`. Our preconditions (that the value is not present), is included.
And our expectation is that the function returns `-1`. Even if all we saw was
the test name (maybe in a failing CI build), we know exactly *how* the code is
broken. If we are not sure what the code is supposed to do, we have *three*
references for what the code *should* do. We have the test assertions. We have
the test name. And finally, we have the implementation code.

As above, if your test framework doesn't support test names this verbose we
could rework the test name, to fit `Act_Arrange_Assert`. That would look like:

```Go
func Test_Array_IndexOf_ValueIsNotPresent_ReturnsNegativeOne(t *testing.T) { ... }
```

## Conclusion

For more info and discussion, there are lots of fantastic test-naming patterns,
in the discussion on [Roy Osherove's "Naming standards for unit
tests"](http://osherove.com/blog/2005/4/3/naming-standards-for-unit-tests.html),
including:

- Unit_StateBefore_StateAfter
- Method_Precondition_Postcondition
- Act_Arrange_Assert

Ultimately, test naming is about making your own job easier in the future. BDD
can help communicate requirements from non-technical partners. Property-Based
naming can help communicate more technical low-level requirements. It is up to
you to pick which works for you, and *think* through what your test is trying to
express.
