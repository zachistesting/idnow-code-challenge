import { type Step, type WorkflowState, DependencyMap, StepMap, StepStatus } from "./types";
/**
 * Executes a workflow of interdependent steps.
 *
 * @param steps - Array of step definitions with dependencies
 * @returns Record of step IDs to their final execution state
 */
export async function executeWorkflow(steps: Step[]): Promise<WorkflowState> {
  // Requirements:
  // 1. Initialize all steps in WAITING state => DONE
  // 2. Use a logical clock tick based execution loop => DONE (could be better?)
  // 3. Only execute steps when their dependencies are satisfied => DONE
  // 4. Track state transitions: WAITING → RUNNING → COMPLETED/FAILED => DONE
  // 5. Handle both linear and branching workflow patterns => DONE
  // 6. Return the final state of all steps => DONE

  const workflowState = initWorkflowState(steps)
  const { stepMap, dependencyMap } = initMappings(steps)
  const executionQueue = initExecutionQueue(dependencyMap)

  // Tick Tick Tick
  let clock = 0
  while(executionQueue.length){
    // Set the starting clock and increment the ticks
    const startClock = clock++

    // Get the available steps in the current loop (tick)
    const stepsAvailable = executionQueue.length

    const currentSteps: string[] = []
    const promises: Promise<void>[] = []

    for(let i = 0; i < stepsAvailable; i++){
      const stepId = executionQueue.shift()
      if(stepId === undefined) continue
      currentSteps.push(stepId)
      workflowState[stepId] = {
        status:  StepStatus.RUNNING,
        startClock: startClock,
      }
      promises.push(simulateStepExecution(stepId))
    }

    const results = await Promise.allSettled(promises)

    for(let i = 0; i < currentSteps.length; i++){
      const stepId = currentSteps[i]
      if(stepId === undefined) continue
      const result = results[i]
      const newStepState = {
          startClock: startClock,
          finishedClock: clock
        }

      if(result?.status === "fulfilled"){
        workflowState[stepId] = {
          ...newStepState,
          status:  StepStatus.COMPLETED,
        }

        // Skip if there are no next steps
        const nextSteps = stepMap.get(stepId)
        if(!nextSteps) continue

        /**
         * For each one of our next steps:
         * 1- We check if it has dependencies and how many of them need to run before we are able to run enqueue the step for execution
         * 2- If it has no dependencies then we just continue to the next step in the array
         * 3- If it DOES have dependencies then we need to decrement its dependencies count first, then check it reached a ready state (which is 0)
         * 4- If it does reach 0 after decrementing, we enqueue it for execution on the next loop of our Queue
        */
        for (const nextStepId of nextSteps){
          let dependencies = nextStepId && dependencyMap.get(nextStepId)
          if(!dependencies) continue

          dependencyMap.set(nextStepId, dependencies - 1)

          dependencies = nextStepId && dependencyMap.get(nextStepId)
          if(dependencies === 0) executionQueue.push(nextStepId)
        }
      } else{
        workflowState[stepId] = {
          ...newStepState,
          status:  StepStatus.FAILED,
        }
      }
    }
  }
  return workflowState;
}

/**
 * Simulates step execution work
 * In a real system, this would perform the actual step logic
 */
async function simulateStepExecution(stepId: string): Promise<void> {
  // Simulate work and occasional failures
  // For testing purposes, steps starting with "fail" will fail
  if (stepId.startsWith("fail")) throw new Error("Step failed!");
  return;
}

/**
 * Initializes the workflowState for each of our steps as WAITING
 */
function initWorkflowState(steps: Step[]): WorkflowState {
  return steps.reduce((acc, step) => {
    acc[step.id] = { status: StepStatus.WAITING };
    return acc;
  }, {} as WorkflowState);
}

/**
  * Initializes a stepMap by converting steps array into a map for efficient O(1) lookups
  *
  * Creates a dependency count mapping between our steps and how many dependencies they have (Also known as an inDegree Map)
  */
function initMappings(steps: Step[]): {stepMap: StepMap, dependencyMap: DependencyMap } {
  const stepMap: StepMap = new Map()
  const dependencyMap: DependencyMap = new Map();
  for (const step of steps){
    stepMap.set(step.id, step.next)

  if(!dependencyMap.has(step.id)) dependencyMap.set(step.id, 0)
    for (const nextStepId of step.next){
      dependencyMap.set(nextStepId, (dependencyMap.get(nextStepId) || 0) + 1)
    }
  }

  return {stepMap, dependencyMap}
}

/**
 * Initializes a queue to hold our steps that need to be executed
 * For simplicity reasons we are using an array representation of a Queue and not a real Class-Based Queue Data Structure
 */
function initExecutionQueue(dependencyCount: Map<string, number>): string[] {
  const queue: string[] = []
  for (const [stepId, dependencies] of dependencyCount.entries()){
    if(dependencies === 0) queue.push(stepId)
  }

  return queue
}
