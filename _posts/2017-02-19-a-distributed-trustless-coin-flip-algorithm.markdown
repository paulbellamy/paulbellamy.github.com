---
layout: post
title: A Distributed Trustless Coin-Flip Algorithm
---

{{ page.title }}
----------------

##### 19 February, 2017

A common situation in distributed computing is leader election. Most
often, this is achieved by coordinating to pick a random outcome.
There are quite a few well-known distributed algorithms for picking a
"random" outcome, including FloodMax, and LCR.

Unfortunately, LCR requires that the topology of your nodes is a ring.
And, while FloodMax will work even if the topology is not a ring, both
algorithms assume that all participants are trustworthy. Both
FloodMax, and LCR work by having participants exchange numbers, where
the biggest number wins. However, they assume that participants will
not specifically pick their number in order to win. If we assume that
participants are trying to purposefully win the election, they would
each choose as big a number as possible (within the range), thereby
deadlocking the election. Furthermore, in order to win, participants
might change their selection after seeing other selections.

In order to have a simple leader election process which cannot be
"gamed" we must:

- stop participants changing their selection
- stop participants knowing anything about another selection before making their own
- ensure that no selection has any significant advantage over any other
- ensure that no group of participants can collude to influence the outcome

Ideally, the chosen algorithm should be usable for any number of
participants.

## The Algorithm

The algorithm presented is divided into two phases. First, each
participant publicly commits to their chosen selection without
revealing it. Once all participants have completed this phase, they
must reveal their selection. Any participant can then combine all
selections and verify the outcome.

In describing this algorithm, I'll be assuming that:

- there is a way of distributing a message at-least-once to all participants
- there is a way of verifying when this has happened
- each participant has a sortable, unique ID
- there is a way of differentiating messages from different participants
- the list of participants is known before beginning

There may be ways around these criteria, but they make it easier to
explain the algorithm.

### Phase One - Committing To Their Selections

For a simple example let's say we have 2 participants (A and B), and each
selection may be between 1-100.

First, each participant secretly makes their selection, and computes a
hash of it. For this example, I'll be using sha1 hashing abbreviated
to 6 characters, but the specific hashing function chosen is not
important to the operation of the algorithm.

```
Participant  A        B
Selection    6        47
Hash         ccf271   5de163
```

Once generated, each participant broadcasts their hash, but keeps
their selection a secret.

This phase is analogous to each participant selecting a playing card,
and placing it face-down on the table. All other participants can see
they have made a selection, and can tell if they were to try to change
it.

After all nodes have received the hashes from all other nodes, phase
two commences.

### Phase Two - Reveal Their Selections

Phase two is where each participant then reveals their secret
selection. Because they have previously exchanged the hashes, they are
already committed to their selections and cannot modify their
selection in order to win. Once this phase is completed all nodes know
the selections of all other nodes.

They may then combine the selections to compute the resulting outcome:

```
Participant  A        B
Selection    6        47
Combined        6*47 = 282
Combined Hash  3fde1d
```

In order for all participants to reach the same outcome, the combining
function must be the same, and should account for receiving the hashes
in a differing order. I've used multiplication here, because it is
associative and commutative. You could reach a similar outcome with
other functions by sorting the selections.

Because the outcome of our hashing algorithm is indistinguishable from
a pseudo-random selection, we have generated a pseudo-random hash (in
this case, `3fde1d`). This is analogous to a coin-flip, or rolling a
N-sided die.

If we wish to elect a leader based on this information, we could
divide up the outcome range among the participants, and assign the
winner. For example, because we have 2 participants, we can divide the
outcome into 2 spaces: odd for `A`, and even for `B`. Then, any
participant can look at the first digit of the outcome, note that it
is `3`, which is odd, and determine that `A` has been elected the new
leader.

## Summary, Caveats, and Additional Notes

I've skipped over several very important implementation details, such
as: selecting the "win-condition" for each participant, and agreeing
on each participant's ID. But, different implementation spaces provide
answers to this. For example, if the participants were communicating
via a blockchain, they would naturally have sortable IDs and easily be
able to divide up the "win-conditions" fairly.

As presented, the selections are random. This means each time the
election is run the outcome will be random. If you wished to introduce
more stability into the system you might think that using a persistent
selection on each node (say some system UUID) would provide that.
However, this creates a way for participants to gain an advantage in
repeated elections because they can remember the selections of other
nodes.

I've also elided adding a "salt" to the hashes to prevent leakage of
information. This is because I've assumed that (in real
implementation) the selection range is large enough that any two nodes
picking the same number is unlikely. If your selection range is small,
you should add a salt to the broadcast hashes, to ensure that
rainbow-tables cannot be built to allow participants an unfair
advantage.

This is a very simple algorithm for a trustless distributed coin-flip
(or die-roll). In the example I've applied it to a leader-election
scenario, but it is more general, and results in a trustless
group-selection of a random outcome.

As far as I know this algorithm is unique, but if you know of any
others, or if you think this algorithm is a variant of some other, I
would love to know! Any improvements, or feedback are welcome.
