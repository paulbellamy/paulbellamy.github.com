---
title: Introducing Mango
---

## What?

Mango is a modular web-application framework for Go, inspired by [Rack](http://github.com/rack/rack) and [PEP333](http://www.python.org/dev/peps/pep-0333/). It is most of all a framework for other modules, and apps.  It takes a list of middleware, and an application, and compiles them into a single http server object. The middleware and apps are written in a functional style, which keeps everything very self-contained.

It aims to make building reusable modules of HTTP functionality as easy as possible by enforcing a simple and unified API for web frameworks, web apps, and middleware.

## Why?

Why not? Mango really started as an experiment. I often feel that one of the best ways to learn how something works (at least with software) is to build it.

Hopefully people will find it at least moderately useful, and it can be improved together.

## How?

You should check out the [github repo](http://www.github.com/paulbellamy/mango) for a more in-depth view of how to build apps and middleware for Mango.

That being said...

### How to build a basic Mango App

Mango structures web applications around the idea of a "stack".  A stack is comprised of consecutive layers of middleware, and a core application. Like an onion, but with less tears.

Mango apps can be as simple as:

    func Hello(env mango.Env) (mango.Status, mango.Headers, mango.Body) {
      return 200, mango.Headers{}, mango.Body("Hello World!")
    }

To instantiate this app we can do:

    func main() {
      // Create a new mango.Stack
      stack := new(mango.Stack)

      // Tell our stack what address to listen on
      stack.Address = "0.0.0.0:3000"

      // Set the stack's application and begin listening
      stack.Run(Hello)
    }

### Including Middleware

Middleware is where Mango really starts to become useful, so let's write a quick app that uses some custom error handling magic.

    func PanickyPat(env Mango.Env) (mango.Status, mango.Headers, mango.Body) {
      panic("My name is Pat, and I ... FREAK OUT!")
      return 200, mango.Headers{}, mango.Body("Phew! Didn't panic!")
    }

Now, if we want to catch these errors, and instead show a nice error page we can use Mango's ShowErrors middleware.

    func main() {
      stack := new(mango.Stack)
      stack.Address = "0.0.0.0:3000"

      // Add in our middleware
      // First we set up an html template
      // for our errors to be displayed in.
      errorTemplate = `
        <html>
          <head>
            <title>Caught Error</title>
          </head>
          <body>
            <h1>Pat is panicking right now...</h1>
          </body>
        </html>
      `

      // Now we instantiate our middleware
      errorCatcher = mango.ShowErrors(errorTemplate)

      // And insert it into the stack
      stack.Middleware(errorCatcher)

      // And run our application,
      // wrapped in error-safe goodness,
      // like diapers on a duck!
      stack.Run(PanickyPat)
    }

Now, whenever our application throws an error we will instead get a nice error page explaining that Pat is busy panicking.

### Writing Custom Middleware

Writing your own middleware for Mango is really straightforward, but its a bit more in-depth than this document needs to be. Check out the [github repo](http://github.com/paulbellamy/mango) for more information on that.

## Available Middleware

As of this writing the list of middleware is small, but it will hopefully be growing rapidly.

* Sessions
* Logger
* ShowErrors
* Routing

## How Fast Is It?

I've included some benchmarks in the mango\_test.go file, you can run them with:

    gotest -test.bench=".\*"

On my laptop I get about 0.14-0.16 ms per request, which is about 6500-7000 requests/second.  So, it's fairly fast.  No doubt there is room for improvement to happen as the project develops.

## More Info

Check out the [github repo](http://github.com/paulbellamy/mango) for more information on Mango, and to stay up to date on the newest developments.
