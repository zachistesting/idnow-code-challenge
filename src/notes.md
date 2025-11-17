# Prelude
This problem perplexed me at first, then after some probing online I figured it's a graph problem (obviously).. so I stuied trees, graphs and solved Course Schedule 1 and 2 and learned DFS and BFS on trees and graphs and now here I am. I didn't wanna screenshot the whole thing and throw it at an LLM because I like the challenge and it's been honestly good for me to brush up on a lot of CS topics.

My very first thought was that this is a classic DFS problem specifically because of the workflowStates which is how we would avoid cycles in the DFS call stack, but thinking about the clock you keep mentioning, it looks like you're eluding to an inDegree map and that this is a BFS problem, more specifically Kahn's Algorithm for topological sort.

# What's going on in my head
steps = adjacency map (we have steps and their next, so their dependents/child nodes)
clockMap = inDegree map

we don't have the edgeMap (which step has a dependency on which other step) => should it be derived from adjacency map? can I use the adj map direcrly to create the damn inDegree man?? => answer is YES we can!

While creating the tiktok map, my first intuituin was to first derive an edgeMap from our steps then use it to create an inDegree map, but quickly noticed that and steps, edge and inDegree are all just different representations of the same graph and it SHOULD be possible to go from adjacency to inDegree. The most obvious solution was to loop twice, once to init all the step degrees as 0 and another one to handle all the step.next[] (the children)

I'm looking at the provided WorkflowState and wondering if I'm not overcomplicating everything here.. that looks like a global state management system.. we'll come back to it later, first I need a somewhat working solution to get some confidence in where I'm going, then we'll optimize

A queue might not be the correct way to run this thing..

Okay I got confused by my own naming of the inDegree map, that's not the clock you are referring to.. the "clock ticks" I wrongly assumed were the actual inDegree map, but now I'm realizing that you mean a literal clock that keeps track of execution of steps. The inDegree map will help us find WHICH steps to start in and in which order, but there should be a global clock that "ticks" everytime there is an execution and increments the RUNNING steps. I'm gonna follow this line of thought and see where it leads. So far this is still a BFS problem and the queue is the right choice in my opinion


I'm gonna start very simple and try to pass the first test case, it's also not fun to work on this IDE and only catch type errors on tranpilation..

we need to make sure that only the first dependencies (plural) run before everything else, we already push that first dependency in our queue after creating the inDegreeMap.

I've been fighting with types for a while now and it's a bit frustrating.... and now I just figured out my biggest typing frustration :) I have been working with an array of objects as if it's a damn single object.. truly a master at my craft!

Can't believe I'm fighting with types instead of solving this

One simple test passed....

The first simple describe block now passes, but I need a better way to handle clocks and handling branches will be not be trivial.. we'll see

Good think is the inDegreeMap handles the edge cases too.. Viva Kahn's Algo!

Okay eveything seems to pass... because of course since we are already using the inDegreeMap AND our adjacency (steps[]) map to push to our queue.. I was about to start somehing that loops on queue.length and executes the simulations but I guess that's maybe more inline with a real system behavior

Now time to polish it.


I don't feel satisfied with my current solution, I think I can make it more efficient maybe.. but I need a pause now

I'm trying to run branch1 and branch2 in parallel because both have a dependencyCount of 1 and SHOULD be enqueued together

I'm just trying stuff here.. I wanna see if I can run first set the steps as running, then "theoretically" run the steps in parallel, and at the end set the steps as Complete or Failed based on the allSettled results.. bear with me bear with me

Okay I don't need to change the exisitng types, I'll do without an optimized workflowState.

The test is passing but I still feel it's not paralllel, the "currentSteps" array never contains more than one tiem at a time, even when the queue is holding more than one step

Okay so I was facing a small bug where the queue was being not being correctly dequeued because I was looping on its actual size and not a snapshot of it.. I've had the same problem a few days ago doing something else. Now we can correctly see that if executionQueue: [ 'good-branch', 'fail-branch' ] then { currentSteps: [ 'good-branch', 'fail-branch' ] }
The problem is that if I loop on the actual queue size, then DEQUEUE inside the loop, then the damn size changes! anyway..

Okay, this is done and parallel execution works.

Added some tests for parallellism

I think I've done enough, this was fun!
