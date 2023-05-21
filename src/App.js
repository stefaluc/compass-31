import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';

import React from 'react';
import './App.css';
import { Button, Divider, Typography } from '@mui/material';
import { data } from './data';

const calcIsOutOfRange = (question) => (
  question.value != null &&
  (question.value <= 0 ||
  question.value > question.pointsKey.length)
);

const calcIsInRange = (question) => (
  question.value != null &&
  (question.value > 0 &&
  question.value <= question.pointsKey.length)
);

const countQuestionsDone = (questionList) => {
  let questionCount = 0;

  for (const question of questionList) {
    if (calcIsInRange(question)) {
      questionCount++;
    }
  }

  return questionCount;
}

function App() {
  const [formData, setFormData] = React.useState(data);
  const [orthoCount, setOrthoCount] = React.useState(0);
  const [orthoScore, setOrthoScore] = React.useState(0);
  const [emphasized, setEmphasized] = React.useState(false);

  const numQuestions = data.reduce((count, item) => count + item.questions.length, 0);
  const numQuestionsDone = countQuestionsDone(formData.flatMap(item => item.questions));

  React.useEffect(() => {
    let intervalId;

    const animateCount = () => {
      if (orthoCount < orthoScore) {
        setOrthoCount((prevCount) => prevCount + 1);
      } else if (orthoCount > orthoScore) {
        setOrthoCount((prevCount) => prevCount - 1);
      } else {
        clearInterval(intervalId);
      }
    };

    intervalId = setInterval(animateCount, 20);

    return () => clearInterval(intervalId);
  }, [orthoCount, orthoScore]); 

  // React.useEffect(() => {
  //     setEmphasized(true);
  //     setTimeout(() => {
  //       setEmphasized(false);
  //     }, 500);
  // }, [formData]);

  return (
    <>
      <LinearProgress 
        sx={{width: '100vw', position: 'fixed', left: 0, top: 0, zIndex: '9999'}}
        variant="determinate"
        value={(numQuestionsDone / numQuestions) * 100}
        color="secondary"
      />
    <div className="App">
      <h2><span className='title'>COMPASS-31</span>&nbsp; The Composite Autonomic Symptom Score</h2>
      <div>
        <Typography sx={{color: 'rgb(107, 109, 111)'}}>
          Input the patient's selected answer number for each question to calculate the final scores.
        </Typography>
      </div>
      {formData.map((item, i) => {
        const numQuestionsDoneInSection = countQuestionsDone(item.questions);
        const areAllQuestionsDone = numQuestionsDoneInSection === item.questions.length;

        return (
        <>
          <div key={item.id} className="box">
            <h3>{item.domain}</h3>
            <Divider />
            <ol>
              {item.questions.map((question, j) => {
                const key = `d${item.id.toString()}q${question.id.toString()}`;
                const isOutOfRange = calcIsOutOfRange(question);

                return (
                  <li key={key} value={question.id}>
                    <Typography>{question.questionText}</Typography>
                    <TextField
                      error={isOutOfRange}
                      type='number'
                      sx={{ marginTop: '5px' }}
                      onChange={(e) => {
                        const newQuestions = [
                          ...item.questions.slice(0, j),
                          {
                            ...question,
                            value: parseInt(e.target.value),
                          },
                          ...item.questions.slice(j + 1),
                        ];

                        let newScore = 0;
                        item.questions.forEach(q => {
                          if (q.id === question.id) {
                            newScore += q.pointsKey[parseInt(e.target.value) - 1] ?? 0
                          } else {
                            newScore += q.pointsKey[q.value - 1] ?? 0
                          }
                        });
                        const newFormData = [
                          ...formData.slice(0, i),
                          {
                            ...item,
                            currentScore: newScore,
                            questions: newQuestions,
                          },
                          ...formData.slice(i + 1),
                        ];

                        setFormData(newFormData);
                        setOrthoScore(parseInt(e.target.value));
                      }}
                    />
                  </li>
                )
              })}
            </ol>
            <div className={`score ${areAllQuestionsDone ? 'emphasized' : ''}`}>
              {item.currentScore}&nbsp;/&nbsp;{item.maxScore}
            </div>
          </div>
        </>
      )})}
      <div className="button">
        <Button sx={{ margin: 10, width: '200px', height: '50px' }} variant='contained' color="secondary">Calculate Score</Button>
      </div>
    </div>
    </>
  );
}

export default App;
