import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
    } else if (question.dependent) {
      const dependentQuestion = questionList.find(q => q.id === question.dependent);
      if (dependentQuestion.value === dependentQuestion.dependentAnswer) {
        questionCount++;
      }
    }
  }

  return questionCount;
}

function App() {
  const [formData, setFormData] = React.useState(data);
  const [orthoCount, setOrthoCount] = React.useState(0);
  const [orthoScore, setOrthoScore] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const numQuestions = data.reduce((count, item) => count + item.questions.length, 0);
  const numQuestionsDone = countQuestionsDone(formData.flatMap(item => item.questions));
  const totalScore = formData.reduce((count, item) => count + item.currentScore, 0);
  const totalScoreComplex = formData.reduce((count, item) => count + (item.currentScore * item.multiplier), 0);

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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    window.location.reload();
  };

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
                let isDisabledDependent = false;
                if (question.dependent) {
                  const dependentQuestion = item.questions.find(q => q.id === question.dependent);
                  isDisabledDependent = dependentQuestion.value === dependentQuestion.dependentAnswer;
                }

                return (
                  <li key={key} value={question.id}>
                    <Typography style={{fontSize: 'clamp(.8rem, 0.6rem + 1vw, 1rem)'}}>{question.questionText}</Typography>
                    <TextField
                      error={isOutOfRange}
                      type='number'
                      sx={{ marginTop: '5px' }}
                      size="small"
                      color="secondary"
                      disabled={isDisabledDependent}
                      label={isDisabledDependent ? 'N/A' : ''}
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
                    {isDisabledDependent &&
                      (
                        <Tooltip title={`This question is dependent on question: ${question.dependent}`}>
                          <IconButton sx={{ position: 'relative', top: '8px' }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                    {(question.type === 'checkmark' && !isDisabledDependent) &&
                      (
                        <Tooltip title={`Enter '1' if none are checked, '2' if one is checked, and '3' if both are checked.`}>
                          <IconButton sx={{ position: 'relative', top: '8px' }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                      )
                    }
                    {isOutOfRange &&
                      (
                        <Typography color="error">This number is not a valid patient answer.</Typography>
                      )
                    }
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
        <Button
          sx={{ width: '200px', height: '50px' }}
          variant='contained'
          color="secondary"
          //disabled={numQuestionsDone !== numQuestions}
          onClick={handleOpen}
        >
          Calculate Score
        </Button>
      </div>
    </div>
      {open && (
        <Dialog
          fullScreen={fullScreen}
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
          fullWidth
          maxWidth="md"
        >
          <DialogTitle id="responsive-dialog-title">
            <h2>{"Patient's COMPASS-31 Score"}</h2>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left"><h4>Domain</h4></TableCell>
                      <TableCell align="left"><h4>Sum&nbsp;Score</h4></TableCell>
                      <TableCell align="left"><h4>Multiplier</h4></TableCell>
                      <TableCell align="left"><h4>Sum Score w/ Multiplier</h4></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.map((row, j) => (
                      <TableRow
                        key={row.domain}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                      >
                        <TableCell component="th" scope="row">
                          {row.domain}
                        </TableCell>
                        <TableCell align="left">{row.currentScore}</TableCell>
                        <TableCell align="left">{row.multiplier}</TableCell>
                        <TableCell align="left">{row.currentScore * row.multiplier}</TableCell>
                      </TableRow>
                    ))}
                      
                  </TableBody>
                </Table>
              </TableContainer>
              <br />
              <div><h4>Total Score (Simplified): {totalScore}</h4></div>
              <div><h4>Total Score (COMPASS-31): {totalScoreComplex}</h4></div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {setOpen(false)}} color="tertiary">
              Edit Previous
            </Button>
            <Button onClick={handleClose} autoFocus color="secondary" variant="outlined">
              Calculate Another Score
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}

export default App;
