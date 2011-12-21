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

    $ goinstall github.com/madari/go-socket.io
    $ goinstall github.com/hoisie/mustache.go
    $ goinstall github.com/hoisie/redis.go

Now that that is all set up and ready to go we can begin building our app!


### Project Structure

Since it is a fairly basic project we won't need too much structure.
All our go files (both of 'em) will live in the root directory.  Additionally, we'll have a 'static' directory for our static web assets (html, js, and css files).


### First Steps

Let's start with a really easy first step.  Serving up a static html file!

Fortunately, go makes this really easy to do.

    // server.go
    package main

    import (
      "http"
      "log"
    )

    func main() {
      http.Handle("/", http.FileServer("static/", "/"))
      if err := http.ListenAndServe(":3000", nil); err != nil {
        log.Fatal("ListenAndServe: ", err)
      }
    }

&nbsp;

    // static/index.html

    <h1>Hello World!</h1>

Here we fire up the server and tell it to serve up files from the 'static' directory. So if we put our html files there it will automatically serve them for us.
We're ready to compile and run with:

    // for 64-bit machines
    $ 6g server.go && 6l -o server server.6 && ./server
    2011/03/14 21:54:26 web.go serving 0.0.0.0:3000

    // for 32-bit machines
    $ 8g server.go && 8l -o server server.8 && ./server
    2011/03/14 21:54:26 web.go serving 0.0.0.0:3000

If we pull up a browser to http://localhost:3000 we should see "Hello World!".  Now that we've got a basic server serving up static files, let's give it something a bit more interesting to show our fellow commenters.


### Data

Showing static pages is a bit simplistic, so next we'll focus on getting the web app storing some real data, and returning it as json.

For talking to Redis we'll be using redis.go, which we installed earlier. We'll add a few lines to our server to get it connecting to Redis.

    // server.go

    package main

    import (
      "http"
      "log"
      "github.com/hoisie/redis.go" // Import redis.go
    )

    var client redis.Client // Set up the client

    func main() {
      client.Addr = "localhost:6379" // Tell it where the redis server is

      http.Handle("/", http.FileServer("static/", "/"))
      if err := http.ListenAndServe(":3000", nil); err != nil {
        log.Fatal("ListenAndServe: ", err)
      }
    }

Next up is saving and serving JSON from our database. For this we'll be creating a class in go. Let's call it our 'Comment' class. Hold onto your hats, cause it's a big one.

    // comments.go
    package main

    // Import some packages we'll need
    import (
      "time"
      "fmt"
      "json"
      "strconv"
      "bytes"
      "os"
      "log"
    )

    type Comment struct {
      Id        int64
      Author    string
      Body      string
      CreatedAt int64
      PageUrl   string
    }

These is our basic data-structure.  In go classes are composed of datastructures and methods which act on it. For this we'll be storing a comment UUID (called Id), a string for the author's name, a string for the body, a timestamp for when the comment was posted, and the page url that the comment was posted on. We won't be using the page url, but it is left as an exercise for the reader.

    func New(j []byte) (c Comment, err os.Error) {
      err = json.Unmarshal(j, &c)

      return c, err
    }

Our first method we'll need to be able to do is to store create a new comment from some JSON.  This method takes a byte-slice (\[\]byte) of json, and turns it into a Comment. The go "json.Unmarshal" function takes two arguments, the json, and a reference to the storage location.  It will try to match up the fields in the json with their appropriate fields in the storage, so this will give us back a fully-populated Comment object. Our 'New' method follows the 'comma-ok' idiom (which is common in go). It returns two fields, first, the result, and second, an error (or nil). A lot of functions in go follow the comma-ok idiom.

    func Create(j []byte) (c Comment, err os.Error) {
      c, err = New(j)
      if err != nil {
        log.Println(fmt.Sprintf("Error Parsing Comment: %s", err))
        return c, err
      }

      if err = c.Save(); err != nil {
        log.Println(fmt.Sprintf("Error Saving Comment: %s", err))
        return c, err
      }

      return c, nil
    }

Coming from Ruby, I sort of expect my models to have a 'New' method which returns an unsaved object, and a 'Create' method which returns a saved object. This is the create method. It returns a saved Comment object, and follows the comma-ok idiom. This Create method calls our 'New' method to parse the JSON, and then if that went ok it attempts to save the comment to the database and return it.

    func Find(id int64) (c Comment, err os.Error) {
      js, _ := client.Get(fmt.Sprintf("comment:id:%d", id))
      return New(js)
    }

Now, if we want to display some comments we'll need to be able to get them out of the database. 'Find' will take a comment Id, and return the object associated with it from redis.  In Redis we are storing our comments as serialized JSON strings. So, comment 5 would be like:

    Key             Value
    comment:id:5 => {"Author":"Bill", "Body":"Hi", "PageUrl":"/some-blog-post"}

It's not a terribly flexible schema, but it provides all the flexibility we need.

    func PaginateFor(url string, start int, count int) (c []Comment) {
      commentIds, _ := client.Lrange(fmt.Sprintf("comment:page_url:%s", url), start, count)
      for _, idString := range commentIds {
        id, _ := strconv.Atoi64(string(idString))
        comment, err := Find(id)
        if err == nil {
          c = append(c, comment)
        }
      }
      return c
    }

Now, 'Find' is great if we only want to retrieve a single comment, but we want to show several at a time, paginated. To support this pagination we are storing one more piece of data in Redis, which is a list of comment IDs for a given page.

    Key                                 Value
    comment:page_url:/some-blog-post => [5, 4, 3]

This key lets us query based on a page url and retrieve a list of posts on that page. So, we can use that in PaginateFor to retrieve a subset of those IDs from redis. Then for each id, we retrieve the actual comment from redis, and return the array of our paginated comments.

    func (c *Comment) ToJson() (j string) {
      if j, err := json.Marshal(c); err != nil {
        log.Println("Error Encoding Comment to Json: ", err)
      } else {
        return string(j)
      }
      return ""
    }

If we are going to be sending our comments out to clients (or storing them in the database) we will need to be able to convert them into json.  Go makes this really easy!  This method is fairly straight-forward, it simply uses the json.Marshal method (which accepts almost anything, and json-ify's it), and returns the result.  We define this specially so we can use the comment.ToJson() syntax.

    func (c *Comment) Save() (err os.Error) {

      newRecord := false
      if c.Id == 0 {
        newRecord = true
      }

      if newRecord {
        // New record we should get an Id for it
        id, err := client.Incr("global:nextCommentId")
        if err != nil {
          return err
        }
        c.Id = id

        c.CreatedAt = time.Seconds()
      }

      // Store it by the primary key
      client.Set(fmt.Sprintf("comment:id:%d", c.Id), []uint8(c.ToJson()))
      if err != nil {
        return err
      }

      if newRecord {
        // New record we should insert it into the page listing
        err := client.Lpush(fmt.Sprintf("comment:page_url:%s", c.PageUrl), bytes.NewBufferString(strconv.Itoa64(c.Id)).Bytes())
        if err != nil {
          return err
        }
      }

      return nil
    }

This method is where quite a bit of the work is done.  This is our 'comment.Save()' method, which takes our comment and saves it to Redis. First off we check whether this comment is new or not:

    newRecord := false
    if c.Id == 0 {
      newRecord = true
    }

If it *is* a new record we need to get a new ID for it. Redis provides several atomic methods, one of which is Incr.  As you might guess, Incr increments an integer and returns the new value.  If the key does not exist it is initialized to 0, incremented to 1, and returned. We're using 'global:nextCommentId' to store our global comment counter. We'll also set the CreatedAt timestamp to the seconds since the epoch.

Now, we've set the ID for this comment (if it is new), and we must save it to the database. We need to enter it in two places. First, the primary key:

    // Store it by the primary key
    client.Set(fmt.Sprintf("comment:id:%d", c.Id), []uint8(c.ToJson()))
    if err != nil {
      return err
    }

And, secondly, if it is a new record, we'll add it to the left-hand side of the list of comments for its page url.

    if newRecord {
      // New record we should insert it into the page listing
      err := client.Lpush(fmt.Sprintf("comment:page_url:%s", c.PageUrl), bytes.NewBufferString(strconv.Itoa64(c.Id)).Bytes())
      if err != nil {
        return err
      }
    }

Done! Since everything happened according to plan and we haven't hit an error, we can return 'nil' for the error code.

    return nil

### Socket.io Server

We need us a socket.io server! We've got our server talking to the database, but it isn't talking to the world yet!  I've included a third (and final) version of our server below. The major new section is our socket.io event handler methods.  There is one for new connections.  One for disconnections (which doesn't really do anything). And, one for when our server receives a message from the client.

    package main

    import (
      "json"
      "github.com/madari/go-socket.io"
      "github.com/hoisie/redis.go"
      "http"
      "log"
    )

    var client redis.Client

    var sio *socketio.SocketIO

    func socketIOConnectHandler(c *socketio.Conn) {
      j, _ := json.Marshal(PaginateFor("/", 0, 10))
      c.Send("{\"event\":\"initial\", \"data\":" + string(j) + "}")
    }

When a client connects we have to send them a list of existing comments for that page.  We'll do that by sending them a message containing "event":"initial", as well as a list of existing comments to render.

    func socketIODisconnectHandler(c *socketio.Conn) {
    }

When a client disconnects we don't really need to do anything. This is just included for reference.

    func socketIOMessageHandler(c *socketio.Conn, msg socketio.Message) {
      if comment, err := Create([]uint8(msg.Data())); err == nil {
        log.Println("Stored Comment: ", comment.ToJson())
        sio.Broadcast("{\"event\":\"comment\", \"data\":" + comment.ToJson() + "}")
      } else {
        log.Println("Error Storing Comment: ", err)
      }
    }

When we get a message from the client, we want to save it to Redis as a new comment, and when that is done we will Broadcast it back out to all the other users. If you want to limit your comments by page url, this should only broadcast to users on the same page.  However, that is a bit (not much) more complicated, so I've left it out for now.

    func main() {
      client.Addr = "localhost:6379"

      // create the socket.io server and mux it to /socket.io/
      config := socketio.DefaultConfig
      config.Origins = []string{"*"}
      sio = socketio.NewSocketIO(&config)

      sio.OnConnect(socketIOConnectHandler)
      sio.OnDisconnect(socketIODisconnectHandler)
      sio.OnMessage(socketIOMessageHandler)

      mux := sio.ServeMux()
      mux.Handle("/", http.FileServer("static/", "/"))
      if err := http.ListenAndServe(":80", mux); err != nil {
        log.Fatal("ListenAndServe: ", err)
      }
    }

In our 'main' function we now also configure, and initialize Socket.io (configuring it to accept connections from everywhere).  We connect the event handlers for it, and multiplex it into our static file server to handle the /socket.io subdirectory (where the client expects the server to be).


### GUI

I'm definitely not a graphic designer, so we'll be keeping the design aspect of this project to an absolute minimum. This is so it can be styled be the website it will be embedded within. To that end let's flesh out out html page so that we have a place to show our comments.

    // static/index.html
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>livecomments.go</title>
        <link rel="stylesheet" type="text/css" href="css/default.css" media="screen" />
        <script src="js/vendor/underscore.js"></script>
        <script src="js/vendor/socket.io.js"></script>
        <script src="js/vendor/jquery.js"></script>
        <script src="js/vendor/mustache.js"></script>
        <script src="js/vendor/backbone.js"></script>
      </head>
      <body>
        <div id="commentArea">
          <form method="post" action="#" id= 'commentForm' name="newComment" onsubmit="return false">
            <label for="author">Name:</label>
            <input name='newCommentAuthor' type="text" />
            <br />
            <label for="body">Comment:</label>
            <input name='newCommentBody' />
            <br />
            <input type="submit" value='post'/>
          </form>
          <div id='commentHistory'></div>
        </div>
        
        <script src="js/application.js"></script>
      </body>
    </html>

&nbsp;

    // static/css/default.css
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 17px;
      line-height: 25px;
    }

    #commentArea {
      width: 480px;
    }

    .comment {
      margin: 0.75em;
      padding: 0.75em;
      clear: both;
      background-color: #eee;
    }

    .comment .commentAuthor {
      float: left;
      width: 75px;
      margin-right: 25px;
    }

    .comment .commentTimestamp {
      color: #9e9e9e;
      float: left;
      width: 75px;
      margin-right: 25px;
      font-size: 60%;
      padding-top: 0;
      clear: left;
    }

    .comment .commentBody {
      min-height: 50px;
      margin-left: 90px;
      padding-left: 10px;
      border-left: 1px solid #9e9e9e;
    }


### Hooking it Together

Now, we've got our backend saving and serving our data, as well as our interface roughly in place. The large chunk of our app will be written in Backbone.js. For simplicity I've stored all the javascript for this app in one file at static/js/application.js.

We'll use Backbone to format, display, and track the state of our data. First order of business is to get it talking to our Socket.io server.

    // static/js/application.js
    var models = this.models = {};

This will give us a place to keep track of the models we have declared.

    models.Comment = Backbone.Model.extend({});

    models.CommentCollection = Backbone.Collection.extend({
      model: models.Comment
    });

These are the models for our comments, the first is for individual comments, and the second is for a collection of comments.

    models.LiveCommentsModel = Backbone.Collection.extend({
      initialize: function() {
        this.comments = new models.CommentCollection(); 
      }

      // Import a bunch of comments (initial setup)
      , mport: function(data) {
        this.comments.add(data.reverse());
      }
    });

This models our application, and contains our collection of comments. It has an 'mport' method which takes in a list of comments and stores them.


### Showing our comments

Displaying our comments is fairly straightforward, but takes a few lines of code.

    var commentTemplate = '<div class="comment" id="{{id}}"><div class="commentAuthor">{{author}}:</div><div class="commentTimestamp">{{timestamp}}</div><div class="commentBody">{{body}}</div></div>';

    var CommentView = Backbone.View.extend({
      initialize: function(options) {
        _.bindAll(this, 'render');
        this.model.bind('all', this.render);
      }

      , render: function() {
        var commentData = { id: this.model.get('Id')
                   , author: this.model.get('Author')
                   , body: this.model.get('Body')
                   , timestamp: this.model.get('CreatedAt')*1000
                   };
        $(this.el).html(Mustache.to_html(commentTemplate, commentData));
        return this;
      }
    });

This view is in charge of rendering a single comment.  In the initializer for this view we tell it to respond to anything happening by re-rendering.  It renders with Mustache into our commentTemplate.

var LiveCommentsView = Backbone.View.extend({
    initialize: function(options) {
      this.model.comments.bind('add', this.addComment);
      this.socket = options.socket;
    }

This starts our main application view.  It is in charge of rendering our application.

  , events: { "submit #commentForm" : "postComment" }

When the #commentForm is submitted, we should trigger "postComment"

  , addComment: function(comment) {
    var view = new CommentView({model: comment});
    var el = view.render().el;
    $('#commentHistory').prepend(el);
  }

This will add a given comment into our view, render it, and prepend it to our list.  This is used whenever we receive a newly posted comment.

  , msgReceived: function(message){
    message = $.parseJSON(message);
    switch(message.event) {
      case 'initial':
        $('#commentHistory').html('');
        this.model.mport(message.data);
        break;
      case 'comment':
        var newComment = new models.Comment(message.data);
        this.model.comments.add(newComment);
        // Animate the new comment
        var elem = $('#commentHistory .comment#' + newComment.get('Id'));
        elem.slideUp(0);
        elem.slideDown();
        break;
    }
  }

When we get a message from socket.io, we need to handle it.  Our app knows about two different types of messages: 'initial' messages, which we receive once upon connection, and contain the first page of comments, as well as 'comment' messages which are newly posted comments.

  , postComment: function(){
    var author = $('input\[name=newCommentAuthor\]');
    var body = $('input\[name=newCommentBody\]');
    var newComment= new models.Comment({ Author: author.val()
                                       , Body: body.val()
                                       , PageUrl: '/'});
    this.socket.send(newComment.toJSON());
    body.val('');
  }
});

When the #commentForm gets submitted 'postComment' gets triggered. It is responsible for sending the data off to our socket.io server, and clearing out the form. We don't need to worry about adding it and rendering the comment, that will happen when we receive the echoed comment back from the socket.io server)


### Connecting to Socket.io

Great, backbone.js has our data, and can render it to the page.  The last thing we need to do is connect the two into our main application controller. This is where we will connect to our socket.io server.

    var LiveCommentsController = {
      init: function() {
        this.socket = new io.Socket(null);

        this.model = new models.LiveCommentsModel();
        var model = this.model;
        this.view = new LiveCommentsView({model: this.model, socket: this.socket, el: $('#commentArea')});
        var view = this.view;

        this.socket.on('message', function(msg) {view.msgReceived(msg)});
        this.socket.connect();


        return this;
      }
    };

    $(document).ready(function () {
      window.app = LiveCommentsController.init({});
    });

This is our controller class. It is in charge of setting everything up (the socket.io client, the model, the view), and starting the app running.

### Done!

That should be it.  You can check out the whole [source](http://github.com/paulbellamy/livecomments.go). If you need any more support, or have some suggestions, please get in touch with me. Thanks again to fzysqr, hoisie, madari, and others for giving awesome examples to help me wrap my head around this stuff.
