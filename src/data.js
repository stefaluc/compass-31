export const data = [
  {
    id: 0,
    domain: 'Orthostatic Intolerance',
    currentScore: 0,
    maxScore: 10,
    questions: [
      {
        id: 0,
        questionText: `In the past year, have you ever felt faint, dizzy, “goofy”, or had difficulty thinking soon after standing up from a sitting or lying position?`,
        value: null,
        pointsKey: [1, 0],
      },
      {
        id: 1,
        questionText: `When standing up, how frequently do you get these feelings or symptoms?`,
        value: null,
        pointsKey: [0, 1, 2, 3],
      },
      {
        id: 2,
        questionText: `How would you rate the severity of these feelings or symptoms?`,
        value: null,
        pointsKey: [1, 2, 3],
      },
      {
        id: 3,
        questionText: `In the past year, have these feelings or symptoms that you have experienced`,
        value: null,
        pointsKey: [3, 2, 1, 0, 0, 0],
      },
    ],
  },
  {
    id: 1,
    domain: 'Vasomotor',
    maxScore: 5,
    currentScore: 0,
    questions: [
      {
        id: 0,
        questionText: `In the past year, have you ever noticed color changes in your skin, such as red, white, or purple?`,
        value: null,
        pointsKey: [1, 0],
      },
      {
        id: 1,
        questionText: `What parts of your body are affected by these color changes? (Check all that apply)`,
        value: null,
        pointsKey: [1, 1],
      },
      {
        id: 2,
        questionText: `Are these changes in your skin color:`,
        value: null,
        pointsKey: [3, 2, 1, 0],
      },
    ],
  },
];