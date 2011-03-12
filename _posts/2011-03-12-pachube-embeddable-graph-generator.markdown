---
layout: post
title: Pachube Embeddable Graph Generator
---

{{ page.title }}
----------------

##### 12 March, 2011


For a while now we've been hosting internal hackdays at Pachube.  It's an opportunity to work on personal projects, and respond to user requests.  Our users always seem to want more graphs. And why wouldn't they?  Graphs are awesome!

To that end, I've been working on the [Pachube Embeddable Graph Generator.](http://paulbellamy.com/pachube_graph_library)  It's a fantastic little tool to generate custom graphs for embedding in your own website or blog.  They're a great way to show off your data.

So, what kind of graphs can you make? Here's a graph of today's light level in the Pachube office:

<div id="graph" class="pachube-graph" pachube-resource="feeds/504/datastreams/1" pachube-key="1iObDqRLQTi6Z3L-Gf7rKBJfSfSvrwFsmE83KrpYtCY" pachube-options="timespan:24 hours;background-color:#FFFFFF;line-color:#FF0066;grid-color:#EFEFEF;border-color:#9D9D9D;text-color:#555555;" style="width:420px;height:240px;background:white;">
  Graph: Feed 504, Datastream 1
</div>
<script type="text/javascript" src="http://paulbellamy.com/pachube_graph_library/lib/PachubeLoader.js">
</script>
<br />
<br />
 
Not bad, eh? There's lots of options to configure your graphs, for appearances and functionality.  The feature I am definitely most proud of is the "Auto-Update" functionality.  If it is enabled your graph will automatically refresh as new data is received.  It attempts to use Websocket-y goodness for real-time updates if that is available, and if it isn't it falls back gracefully to periodic updates.

There's lots more features to explore, or if you'd like to dig a bit more into how it works you can check out the [source.](http://github.com/paulbellamy/pachube_graph_library)  Keep in mind that it is still very experimental. If you have any comments, suggestions, or just want to show off your awesome graph, please let me know! [Now, go make some awesome graphs!](http://paulbellamy.com/pachube_graph_library)
