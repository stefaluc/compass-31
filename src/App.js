import TextField from '@mui/material/TextField';

import React from 'react';
import './App.css';
import { Button, Divider, Typography } from '@mui/material';
import { data } from './data';

function App() {
  const [formData, setFormData] = React.useState(data);
  const [orthoCount, setOrthoCount] = React.useState(0);
  const [orthoScore, setOrthoScore] = React.useState(0);

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

  return (
    <div className="App">
      <h2><span className='title'>COMPASS-31</span>&nbsp; The Composite Autonomic Symptom Score</h2>
      <div>
        <Typography sx={{color: 'rgb(107, 109, 111)'}}>
          Input the patient's selected answer number for each question to calculate the final scores.
        </Typography>
      </div>
      {formData.map((item, i) => (
        <>
          <div key={item.id} className="box">
            <h3>{item.domain}</h3>
            <Divider />
            <ol>
              {item.questions.map((question, j) => {
                const key = `d${item.id.toString()}q${question.id.toString()}`;
                const isOutOfRange = (
                  question.value != null &&
                  (question.value <= 0 ||
                  question.value > question.pointsKey.length)
                );

                return (
                  <li key={key}>
                    <Typography>{question.questionText}</Typography>
                    <TextField
                      error={isOutOfRange}
                      type='number'
                      sx={{ marginTop: '5px' }}
                      value={question.value}
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
          </div>
          <div className='score'>{item.currentScore} / {item.maxScore}</div>
        </>
      ))}
      <div className="button">
        <Button sx={{ margin: 10, width: '200px', height: '50px' }} variant='contained'>Calculate Score</Button>
      </div>
    </div>
  );
}

export default App;
