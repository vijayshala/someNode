export function initStepperOptionsState(steps = []) {
  let allStepsDone = true;
  let state = {
    currentStep:steps.length ? 1 : 0,
    totalSteps: steps.length,
    allStepsDone: allStepsDone,
    stepsStatus: {}
  };

  for (var step of steps) {
    step.hideNext = step.hideNext || steps.length <=1
    state.stepsStatus[step.number] = step;
    allStepsDone = step.completed && allStepsDone
  } 

  state.allStepsDone = steps.length <=1 || allStepsDone;
  
  
  return state
}