---
layout: post
title: livecomments.go - Real-time blog comments in Go, backbone.js, socket.io, and redis
---

{{ page.title }}
----------------

##### 03 April, 2011


livecomments.go is meant to make blog comments a bit more fun.  It bridges the gap between comments and a chat-room, allowing real interactions between readers.  I built it in Go, backbone.js, socket.io, and redis as a learning experience, and was inspired by [this guy](http://fzysqr.com/2011/02/28/nodechat-js-using-node-js-backbone-js-socket-io-and-redis-to-make-a-real-time-chat-app/) to post it as a tutorial for others interested in this stack. It is *far* from being done, so take this all with a grain of salt.

## The Ingredients

### Go

[Go](http://golang.org/) is a relatively new language.  It's a statically-typed compiled language, but don't let that intimidate you. It has all the modern conveniences one would expect, virtually instant compile-times, garbage collection, and absolutely phenomenal concurrency. It's fast like C, but safe and fun like Ruby.

## Architecture

Since we're designing a javascript widget to embed within a user's web page we'll end up doing most of the formatting and display of data client-side (i.e. with Backbone.js).  We'll handle the data-access and formatting in Go.  We'll handle storage and message passing in Redis.  And we'll push the data out to clients in real-time with Socket.io.

All-together our architecture will look something like this:

    Redis <--> Go <--> Socket.io <--> Backbone.js


## Building It

### Installing Stuff

First we'll need the core ingredients:

 * [Install Go](http://golang.org/doc/install.html)
 * [Install Redis](http://redis.io/download)

We'll add a few packages for Go, to make our life easier.  Go comes with the package manager 'goinstall' so we'll use that to install a few packages:

    $ goinstall github.com:madari/go-socket.io
    $ goinstall github.com:hoisie/mustache.go
    $ goinstall github.com:hoisie/redis.go

Now that that is all set up and ready to go we can begin building our app!


### Project Structure

Since it is a fairly basic project we won't need too much structure.
All our go files (both of 'em) will live in the root directory.  Additionally, we'll have a 'static' directory for our static web assets (html, js, and css files).


### First Steps

Let's start with a really easy first step.  Serving up a static html file!

Fortunately, go makes this really easy to do.

    // server.go

    <Static HTML serving stuff here>

&nbsp;

    // /static/index.html

    <h1>Hello World!</h1>

go helpfully defaults to serving any files in the /static directory. So if we put our html files there it will automatically serve them for us.
We're ready to compile and run with:

    $ 6g server.go && 6l -o server server.6 && ./server
    2011/03/14 21:54:26 web.go serving 0.0.0.0:3000

If you are on an x86 machine your compile command will be:

    $ 8g server.go && 8l -o server server.8 && ./server
    2011/03/14 21:54:26 web.go serving 0.0.0.0:3000

If we pull up a browser to http://localhost:3000 we should see "Hello World!"  Now that we've got a basic server serving up static files, let's give it something a bit more interesting to show our fellow commenters.


### Data

Showing static pages is a bit simplistic, so next we'll focus on getting the web app storing some real data, and returning it as json.

For talking to Redis we'll be using redis.go, which we installed earlier.

    <GO stuff for redis here>


Next up is saving and serving JSON, from our database.

    <GO server stuff here>


### GUI

I'm definitely not a graphic designer, so we'll be keeping the design aspect of this project to an absolute minimum. This is so it can be styled be the website it will be embedded within. To that end let's flesh out out html page so that we have a place to show our comments.

    <HTML here>

&nbsp;

    <CSS here>


### Hooking it Together

Now, we've got our backend saving and serving our data, as well as our interface roughly in place. The large chunk of our app will be written in Backbone.js.

We'll use Backbone to format, display, and track the state of our data. First order of business is to get it talking to our Socket.io server.

    <Backbone.js models stuff here>


### Showing our comments

Great, backbone.js has our data, and can send data to our server.  The last thing we need to do is teach backbone.js how to render comments onto the page.

    <Backbone.js views stuff here>

### Done!

<Final notes here>
