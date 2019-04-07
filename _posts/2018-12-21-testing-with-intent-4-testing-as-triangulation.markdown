---
title: "Testing With Intent: Testing as Triangulation"
---

Later, in this series, I'll be referring to an analogy called, "Testing as
Triangulation". While obscure, it is an important way to understand the goals
and limitations of testing.

What is a function? It's a way to group and reuse our code. But, in a
mathematics sense, a function is:

$$
f(x) = y
$$

A function $$f$$ takes some input $$x$$, and returns a value $$y$$. Pretty
straightforward. The set of all possible inputs ($$x$$) is the "domain". The set
of all possible outputs ($$y$$) is the "codomain". Then, function $$f$$ is a
mapping from inputs in the domain to outputs in the codomain.

If I asked you what $$f(5)$$ is, you couldn't say. It's totally generic. This is
how all of our code begins. By adding types, we can narrow down huge swathes of
the input/output spectrum. Tests provide specific examples of inputs and outputs
within that spectrum. By combining types and tests, we can convert our code's
requirements into a mould. Then, if our code passes the tests, we know it fits
the requirements.

When you open the map on your smartphone, it contacts each nearby cell towers.
With each cell tower we add our position gets more accurate. As we add tests the
algorithm our tests define gets more and more precise. We narrow down the design
space until the only design remaining is the correct one. Through this process
the solution tends to grow organically. As we add tests, implement the code, and
refactor, we continually refine the result.

Tests push our code into shape. Before writing tests, it is important to
consider the shape we need our code to fill. Some code's contract is extremely
general, like a generic implementation of flat-map. Some is incredibly specific,
like converting numbers to roman-numerals. 

Simply put, think about what the user wants your code to do, then use tests to
drive your design.
