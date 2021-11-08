# ___The Yolk___

### What is a yolk?
### Definitions
### Constraints and KKT
### Complexity in R^2
### Demo
### State of the Art




# What is a yolk?

Given a category that contains qualitative information, finding the middle value is straightforward. If there are an odd number of items within the category, you can sort them and take the middle value (the median). If it is even, we can find the middle two values, and determine some compromise (usually averaging them) to find this middle. 

When we extend to multiple categories, finding our middle value within a (policy) space becomes difficult. When each category is represented within in its own dimension, there does not always exist a single point that satisfies a "middleness" property between all categories. The compromise is the "yolk".

Given m categories of interrelated yet distinct values, a set of points can be graphed into the space R^m. The yolk can be used to find the middle value region between the categories.

"The yolk [...] is a key solution concept in the Eucleadean spatial model as the region of policies where a dynamic voting game will tend to reside [...] it is the smallest ball intersecting all median hyperplanes [of a set]." [1].

A hyperplane is a subspace that is one dimension less than the original or "ambient" space. in R^3, the hyperplane is a plane. in R^2, it is a line. A hyperplane partitions the space.

The median hyperplane is one such that partitions the space whereby each closed half space has at least half of the number of points.

There are an infinite number of median hyperplanes that can divide a set of points. Finding the yolk is NP-hard for arbitrary dimensions. 

Craig Tovey in [1] finds and proves a polynomial time algorithm for finding the yolk in a fixed dimension. This page devouts its purpose to exploring the 2-dimensional case in particular.


# Definitions

* Yolk: Smallest ball intersecting all median hyperplanes

* Hyperplane: A subspace that is one less dimension of its ambient space dividing its ambient space into two halfspaces.

* Median Split: Any pair of subsets such that the union of them is the complete set, and the cardinality of each subset is at least half of the complete set

* Median Hyperplane: A hyperplane that divides the points in a space such that the subsets of the space are consistent with a median split.

* Extremal Median Hyperplane: A median hyperlane that contains m points of the set in R^m.

* Binding points: Points of the set that are on a hyperplane.

* Affine Combination[2]: A linear combinations of distinct points such that the linear combinations sum to one.

* Affine Set: A set containing every affine combination of the points within it.

* Affine Hull: The smallest affine set that contains all of the set of points.

* Determining Hyperplane: A hyperplane that contains points within the set (<=m) containing the Aff(B).

# Constraints and Karush-Kuhn-Tucker conditions

A great deal of Tovey's paper is its handling of the contraints involving the yolk problem. In his proof leading to his threorem he makes several key observations (and in his own words, gets "lucky" along the way):

* Finding the yolk can be framed as a non linear optimization problem to maximize the distance from all median hyperplanes furthest from an arbitrary point.

* This maximization can be adjusted to search through the exponentially large set of all median hyperplanes in refererence to the origin.

* Despite there being an infinite number of median hyperplanes, each of them share identical sets of solutoins "which is only polynomially large".

* This reduces the constraints to just one that is quadratic for which KKT conditions are applied.

* Karush-Kuhn-Tucker conditions allow for inequality constraints to be treated for in an optimizaiton problem

* Karush-Kuhn-Tucker Conditions reduce the consideration from an infinite set to a finite but exponentially large collection of polynomial sized sets of hyperplanes.

* KKT conditions allow the problem to focus on those "determining hyperplanes": the bounded (by binding points) hyperplanes that are normal to a given a vector from the origin. There are a finite (yet still polynomial) number of these dermmining hyperplanes.

* These constraints allow for Theorem 1 and Corollary 1

# Complexity in R^2

*Theorem 1: The determining median hyperplanes suffice to determine the radius of the 0-centered yolk*
*Corollary 1: The radius of r(x) of the x centered yolk can be determined in polynomial time O(n^(m+1) for any fixed dimension m*

For the 2-dimensional case, finding the yolk can be done in O(n^3). This is because there are n choose 1 plus n choose 2 ways to select from median hyperplanes that are bounded by either 1 or 2 points in the set. This is O(n^2) Then, checking whether the hyperplane is median can be done in linear time for a total of O(n^3).

*Theorem 2. For any fixed m, the yolk of n nondegenerate points may be computed in polynomial time O(n^(m+1)^2)*

___For R^2___

First: Find the determining hyperplanes. This is done by counting the combinations of bounded median hyperplanes and can be accomplished in O(n^2)

Second: For each 3-tuple of determing hyperplanes, compute the set of points equidistant from the affine hulls of the hyperplanes. The dimension is fixed, and this is done in constant time. Tovey calls this set of points E and cites |E|=O(n^m(m+1). This means finding |E| is O(n^6).

Third: The yolk center is in E. Go through each point e in E and find the distance between it and the furthest median hyperplane. The smallest such e is the center of the yolk, and that smallest maximum is the radius of the yolk: the smallest radius touching all median hyperplanes. By Corollary 1, this takes O(|E|n^(m+1))= O(n^m(m+1) n^(m+1))= )(n^(m+1)^2). Again O(n^6).

https://glesav.github.io/Yolk_Demo/

DEMO NOTES:

This demo is restricted for the case for n points being odd and the point set forced into general position. There are adjustments to account for this in [1].

The demo only counts for B=2. That is, when I accounted for the median hyperplanes bounded by one point B=1, the demo would run slowly and be restriceted to placing only 3 points. B=1 is shown for several arbitrary points, but their values not go into the calculation of the yolk at the end,

The demo may crash if you place 8-10 points, as the memory may be overwhelmed. 

# State of the Art

Significant progress has been made in the past 30 years on the yolk problem. [4] Cites the 2-dimensinoal case for the yolk can be solved in O(n log n). This is done by exploiting relations of duality and the zones induced by the set of hyperplanes.


# References

[1] Craig Tovey, "A polynomial-time algorithm for computing the yolk in fixed dimension" in Mathematical Programming 57 March, 1992. pp.259-277.

[2] Stephen Boyd, Lieven VAndenberghe, "Convex Optimization". Cambridge University Press. 2009. pp. 21-55.

[3] Geoff Gordon, Ryan Tibshirani. "Karush-Kuhn-Tucker conditions". Optimization 1--725. Avaialble: https://www.cs.cmu.edu/~ggordon/10725-F12/slides/16-kkt.pdf

[4] Timothy M. Chan, Sariel Har-Peled, Mitchell Jones. Optimal Algorithms for Geometric Centers and Depth May, 2021. Available: https://arxiv.org/pdf/1912.01639.pdf

