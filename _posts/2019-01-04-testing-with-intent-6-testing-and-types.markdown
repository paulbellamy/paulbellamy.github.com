---
title: "Testing With Intent: Testing and Types"
---

Does a type system mean automated tests are useless? Not at all! Testing
complements a strong type system. They each check for different things. Tests
and type systems are like apples and oranges. While different, they're related,
and complement each other well.

A good type system makes broad assertions about whole categories of errors. On
the other hand, tests are specific point-assertions about the domain. Types are
more general (and powerful), but are not very specific. They are limited in what
they can express. For example, how many functions are there from `string ->
string`? Loads! Tests are more specific. Tests let you make much more targeted
assertions about your code.

## FizzBuzz Testing

Suppose we were writing [fizzbuzz](https://rosettacode.org/wiki/FizzBuzz) in
Javascript. For that function, we might write some test cases based on the
various input types:

```js
function fizzbuzz(max) {
  ...
}

function testFizzBuzz_input_is_undefined()  { ... }
function testFizzBuss_input_is_not_an_int() { ... }
function testFizzBuss_input_without_this()  { ... }
function testFizzBuss_input_is_negative()   { ... }
function testFizzBuss_input_is_100()        { ... }
```

With a dynamic type system like Javascript, we have to test for:

- undefined inputs
- the wrong type of inputs (`string` vs `int`)
- optional arguments (depending how they're defined)
- `this` being undefined

*Then* we can get to behaviour and expectations!

More likely, we would just skip those tests. Testing for all possible input
types is impractical. Plus, we don't actually know the return type of the
`fizzbuzz` function. Does it return a string? An array? Maybe it calls
`console.log` with the result?

With a dynamic type system tests end up being very defensive. Instead of
proactively testing the properties of the system, they end up spending ages
checking that it doesn't blow up on unexpected input.

When writing the same in a strongly-typed language like Typescript, we can skip
the "defensive testing", and go straight to the core behavioural tests:

```ts
function fizzbuzz(max : int): string[] {
  ...
}

function testFizzBuzz_input_is_negative() { ... }
function testFizzBuzz_input_is_100()      { ... }
```

We already know that the input is defined, and is an int, so there's no need to
test for `undefined`, or `strings`. We already know the output types. We can
move straight onto proactively testing the behaviour and expectations.

## Conclusion

![original 120%](/images/weak_types.png)

With a weak type system we can't make big general statements about our code. So
we have to "spot-check" with tests.

![original 120%](/images/strong_types.png)

With a strong type system we can make big general statements about our code. We
can avoid certain classes of tests.
