# _The Yolk_

An interactive demonstration of the 2-dimensional case of Craig Tovey's
polynomial-time algorithm for computing the **yolk** — the smallest ball that
intersects every median hyperplane of a point set.

**Live demo:** https://glesav.github.io/Yolk_Demo/

### Contents

- [What is a yolk?](#what-is-a-yolk)
- [Definitions](#definitions)
- [Constraints and KKT conditions](#constraints-and-karush-kuhn-tucker-conditions)
- [Complexity in R^2](#complexity-in-r2)
- [The demo](#the-demo)
- [State of the art](#state-of-the-art)
- [References](#references)

# What is a yolk?

Given a single category of qualitative information, finding the middle value is
straightforward. If there are an odd number of items in the category, you can
sort them and take the middle value (the median). If there are an even number,
you can find the middle two values and pick some compromise between them
(usually their average).

When we extend to multiple categories, finding the middle value within a
(policy) space becomes difficult. When each category is represented in its own
dimension, there does not always exist a single point that satisfies a
"middleness" property across all categories simultaneously. The compromise is
the **yolk**.

Given `m` categories of interrelated yet distinct values, a set of points can be
plotted in the space `R^m`. The yolk identifies the middle-value region between
the categories.

> "The yolk [...] is a key solution concept in the Euclidean spatial model as
> the region of policies where a dynamic voting game will tend to reside [...]
> it is the smallest ball intersecting all median hyperplanes [of a set]." [1]

A **hyperplane** is a subspace one dimension lower than the original ("ambient")
space; in `R^3` it is a plane, and in `R^2` it is a line. A hyperplane
partitions the space into two halves.

A **median hyperplane** is one that partitions the space so that each closed
half-space contains at least half of the points.

There are infinitely many median hyperplanes for a given set of points, and
finding the yolk is NP-hard in an arbitrary number of dimensions. In [1], Tovey
gives — and proves — a polynomial-time algorithm for the yolk in any *fixed*
dimension. This page explores the 2-dimensional case in particular.

# Definitions

- **Yolk:** the smallest ball intersecting all median hyperplanes.
- **Hyperplane:** a subspace one dimension lower than its ambient space,
  dividing that space into two half-spaces.
- **Median split:** any pair of subsets whose union is the complete set and each
  of whose cardinality is at least half of the complete set.
- **Median hyperplane:** a hyperplane that divides the points so that the two
  resulting subsets form a median split.
- **Extremal median hyperplane:** a median hyperplane that contains `m` points of
  the set in `R^m`.
- **Binding points:** points of the set that lie on a hyperplane.
- **Affine combination** [2]: a linear combination of distinct points whose
  coefficients sum to one.
- **Affine set:** a set containing every affine combination of the points within
  it.
- **Affine hull:** the smallest affine set containing all of a set of points.
- **Determining hyperplane:** a hyperplane containing the points of the set
  (at most `m` of them) that span `Aff(B)`.

# Constraints and Karush-Kuhn-Tucker conditions

A great deal of Tovey's paper concerns the constraints of the yolk problem. In
the proof leading to his theorem he makes several key observations (and, in his
own words, gets "lucky" along the way):

- Finding the yolk can be framed as a nonlinear optimization problem: minimize,
  over candidate centers, the distance to the *furthest* median hyperplane.
- This optimization can be reformulated to search through the exponentially large
  set of all median hyperplanes relative to the origin.
- Despite there being infinitely many median hyperplanes, they share identical
  sets of solutions "which [are] only polynomially large".
- This reduces the constraints to a single quadratic one, to which the KKT
  conditions can be applied.
- The Karush-Kuhn-Tucker conditions let inequality constraints be handled within
  an optimization problem.
- They reduce the search from an infinite set to a finite (though exponentially
  large) collection of polynomially sized sets of hyperplanes.
- They let the problem focus on the **determining hyperplanes**: the hyperplanes
  bounded by binding points and normal to a given vector from the origin. There
  are a finite (and polynomial) number of these.
- Together, these constraints yield Theorem 1 and Corollary 1.

# Complexity in R^2

> **Theorem 1.** The determining median hyperplanes suffice to determine the
> radius of the 0-centered yolk.

> **Corollary 1.** The radius `r(x)` of the `x`-centered yolk can be determined
> in polynomial time `O(n^(m+1))` for any fixed dimension `m`.

In the 2-dimensional case, finding the determining median hyperplanes can be
done in `O(n^3)`. There are `C(n,1) + C(n,2)` ways to choose a hyperplane bounded
by either 1 or 2 points of the set — which is `O(n^2)` candidates — and checking
whether a given hyperplane is median takes linear time, for a total of `O(n^3)`.

> **Theorem 2.** For any fixed `m`, the yolk of `n` nondegenerate points can be
> computed in polynomial time `O(n^((m+1)^2))`.

### For R^2

1. **Find the determining hyperplanes.** Count the bounded median-hyperplane
   combinations; this is `O(n^2)`.

2. **Build the candidate set `E`.** For each 3-tuple of determining hyperplanes,
   compute the points equidistant from the affine hulls of the three
   hyperplanes. The dimension is fixed, so each is found in constant time. Tovey
   calls this set `E` and bounds it by `|E| = O(n^(m(m+1)))`, which is `O(n^6)`
   for `m = 2`.

3. **Locate the yolk.** The yolk center lies in `E`. For each point `e` in `E`,
   find the distance to the furthest median hyperplane; the `e` minimizing that
   distance is the yolk center, and that minimized maximum is the yolk radius —
   the smallest radius touching every median hyperplane. By Corollary 1 this
   costs `O(|E| · n^(m+1)) = O(n^(m(m+1)) · n^(m+1)) = O(n^((m+1)^2))`, i.e.
   `O(n^9)` for `m = 2`.

# The demo

The demo walks through the construction one stage at a time and lets you build
your own point sets.

**Controls**

- Click in the canvas to place a point; click a point again to remove it.
- **Next / Back** (or the ← / → arrow keys) step through the construction.
- **Random** drops a sample set; **Reset** (or `R`) clears everything; **Clear**
  removes the points but keeps you on the input step.
- The sidebar shows the live count of median hyperplanes and, on the final step,
  the yolk radius.

**Running it locally**

It's a static page with no build step. Open `index.html` directly in a browser,
or serve the folder (e.g. `python3 -m http.server`) and visit
`http://localhost:8000`.

**Notes and simplifications**

- The demo assumes an odd number of points in general position. The adjustments
  for even counts and degenerate configurations are given in [1]; the sidebar
  warns when an even count is placed.
- The yolk is computed from the `B = 2` extremal median hyperplanes (those pinned
  to two points). For each 3-tuple of them, the triangle's incenter and three
  excenters give the candidate set `E` — the points equidistant from three median
  lines. The yolk center is the candidate that *minimizes* the distance to the
  *furthest* median line: a min-max, not a plain maximum. A convex sub-gradient
  refinement then snaps the center to the exact optimum, which also keeps the
  answer correct when the candidate enumeration is capped on large inputs.
- The `B = 1` hyperplanes (pinned to a single point) are drawn as an illustrative
  fan of median lines but, as in the original write-up, are not folded into the
  final yolk computation.
- **Performance.** The construction is built from `O(n^2)` median-line work plus
  the capped candidate pass, and is recomputed only on demand rather than every
  frame. It stays smooth well past the handful of points that exhausted memory in
  the first version, handling dozens of points comfortably.

# State of the art

Significant progress has been made on the yolk problem over the past 30 years.
[4] shows that the 2-dimensional yolk can be solved in `O(n log n)` by exploiting
duality and the zones induced by the set of hyperplanes.

# References

[1] Craig Tovey, "A polynomial-time algorithm for computing the yolk in fixed
dimension," *Mathematical Programming* 57, March 1992, pp. 259–277.

[2] Stephen Boyd, Lieven Vandenberghe, *Convex Optimization*, Cambridge
University Press, 2009, pp. 21–55.

[3] Geoff Gordon, Ryan Tibshirani, "Karush-Kuhn-Tucker conditions,"
Optimization 10-725. Available:
https://www.cs.cmu.edu/~ggordon/10725-F12/slides/16-kkt.pdf

[4] Timothy M. Chan, Sariel Har-Peled, Mitchell Jones, "Optimal Algorithms for
Geometric Centers and Depth," May 2021. Available:
https://arxiv.org/pdf/1912.01639.pdf
