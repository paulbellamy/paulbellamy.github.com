---
layout: post
title: Symptoms Not Causes
---

One simple rule can improve your alerting. Alert on symptoms, not
causes. If users are experience errors or high latency, that's an
alert we care about. If a server is down, that shouldn't be an alert.
Maybe an engineer is doing some repairs on that server. If it isn't
impacting real end-user performance we shouldn't care.

Alerting on causes, like a server being down, will result in
false-positives. It is easy to underestimate the danger of
false-positives. Often we think, "the on-call engineer will just
ignore that alert if it is a false-positive". But they may not *know*
it is a false positive and end up wasting hours trying to track down
the source, even though it is having no user impact. Or, in a crisis,
they may misprioritize and end up investigating the wrong source of
issues. But, the major danger of false positives is when it trains
engineers on-call to ignore the alerts.

Now, of course when a symptom alert does fire, it is the on-call
engineer's job to figure out why. Don't be tempted attempt to
pre-emptively help them by putting alerts on *both* the symptoms and
causes, or you run the risk of false-positives and decrease the
signal-to-noise ratio. It is far better to have helpful, complete, and
consistent dashboards, allowing the people on-call to understand for
themselves. Link to the relevant dashboard and metrics from the alert.
From there the on-call engineer can investigate and understand the
issue.

As a side note, the mantra, "symptoms not causes" will help you write
robust tests to outlast the code they are testing.
