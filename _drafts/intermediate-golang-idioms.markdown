---
layout: post
title: Intermediate Go Idioms
---

There are lots of posts on basic idioms in Go. But, there has been a
lack of posts about more advanced idioms.

<!--
More info here. Add links to other posts.
-->

## Decorators

Decorators are a handy way to achieve, fine-grained control over
visible aspects of a struct. For example, when rendering a struct with
fields only visible to certain users. Thanks to embedding, decorators
work wonderfully in Go:

```Go
// Example here
```

## Constructors, Interfaces, and Implementations

<!--
When to use a package name as the implementation, and interfaces.
As in most languages, there are no hard rules for this. It's a matter
of experience and taste when choosing.
-->

```Go
// Example here
```

## Small, Composeable Interfaces

In Go, it's almost always best to make your interfaces as small as
possible. A key example being the interfaces in the `io` package.
`io.Reader`, `io.Writer`, and `io.Closer`, each only have one method.
If you need to expose additional methods interfaces are very
composable, as seen in `io.ReadCloser`.

For example the minimal method-set of a person database could look
like:

```Go
type PersonLoader interface {
  LoadPerson(name string) *Person
}
```

If we need to expose more functionality we can embed and extend the
interface:

```Go
type PersonAuthenticator interface {
  PersonLoader
  AuthenticatePerson(name, password string) *Person
}
```

The `PersonAuthenticator` interface will include all methods from the
`PersonLoader`, and add methods of it's own.

## Composing Structs

Composing structs is a tidy way to implement an interface, where
methods are routed to different components. For example, if we want to
buffer the reads from a file, while still implementing the
`io.ReadCloser` interface, we should create a small composed struct,
which holds the file handles, and dispatches the methods. For example:

```Go
// Embeds the structs or interfaces we need to implement.
type ReadCloser struct {
  io.Reader
  io.Closer
}

file, err := os.Open(filename)
// Will forward .Read() to our buffered reader, and .Close() to our
// file directly.
&ReadCloser{Reader: bufio.New(file), Closer: file}
```

For more information on this technique, see [Dave Cheney's blog
post](http://dave.cheney.net/2015/05/22/struct-composition-with-go).
