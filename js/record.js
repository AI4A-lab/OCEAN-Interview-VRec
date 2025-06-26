let mediaRecorder;
let recordedChunks = [];
let recording = false; // boolean state recording or not

// random number
let randomNumber = Math.floor(Math.random() * 100);

// counter, local storage
let counter = localStorage.getItem('counter');
if (counter === null) {
    counter = 0;
    localStorage.setItem('counter', counter);
}

const liveFeed = document.getElementById('liveFeed');
const startRecordingButton = document.getElementById('startRecording');
const previewVideo = document.getElementById('preview');
const timerDisplay = document.getElementById('timer');

const question = document.getElementById('question');

const submit = document.getElementById('submit');

// id parameter
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const set_number = urlParams.get('set_number');

// global recording variables for blob recorded
let global_blob;

console.log(id);
console.log(counter);
console.log(set_number);

// ----------------------------------------------------------------------------------

// Questions
const set1 = [
  'Are you more analytical or imaginative? Why?',
  'How do you prioritize your tasks when everything seems important?',
  'How do you recharge after a busy workday?',
  'How do you handle conflicts in the workplace?',
  'Have you ever lost your temper at work? How did you handle it?'
]

const set2 = [
  'What would you do if you were faced with an impossible task / How do you approach solving unfamiliar problems?',
  'What do you do when you realize you\'ve made a mistake?',
  'Do you enjoy being the center of attention?',
  'How do you support a team member who is struggling?',
  'What\'s your biggest fear professionally, and how do you manage it?'
]

const set3 = [
  'Have you ever suggested a new idea or process at work? What was the result?',
  'What do you think is better - being perfect and delivering late or being good and delivering on time?',
  'Do you prefer working in a team or alone? Why? / In which scenario are you most productive: working in a team or independently?',
  'Tell me about a time when you had to compromise.',
  'How do you respond when your workload suddenly increases?'
]

const set4 = [
  'How do you react to unexpected changes?',
  'Do you plan your day ahead or work more spontaneously?',
  'What role do you assume when you work within a team? Are you more of a leader or follower?',
  'Are you more inclined to speak up or keep the peace in disagreements?',
  'How do you feel when someone interrupts you while you are in the middle of an important task?'
]

const set5 = [
  'What does success mean to you?',
  'When you were assigned a task outside of your job description. How did you handle the situation? What was the outcome?',
  'Do you talk to new people at social gatherings or stick with people you know?',
  'How do you handle negative feedback?',
  'Do you consider yourself calm in stressful situations / Tell me about a stressful situation at work and how you handled it?'
]

const set6 = [
  'Do you enjoy routine or do you prefer variety in your tasks? Why?',
  'How do you manage work-life balance?',
  'Tell me what motivates you to succeed in your career?',
  'What do you do if you disagree with another team member?',
  'If you could change one thing about your personality, what would it be?'
]

const set7 = [
  'Have you ever suggested a new idea or process at work? What was the result?',
  'What have you learned from your mistakes?',
  'How do you contribute to a team environment?',
  'How do you navigate through office politics and maintain your integrity?',
  'How do you cope with failure or setbacks?'
]

const set8 = [
  'What\'s the last book, film, or experience that changed your perspective?',
  'How do you keep yourself organized at work?',
  'What role do you usually take in group situations?',
  'Describe a time you helped a colleague without being asked.',
  'Have you ever felt frustrated due to a lack of career progress?'
]

const set9 = [
  'What do you do with your free time when you have no plans?',
  'Consider the scenario: You win a million-dollar lottery. Would you still be working?',
  'How do you initiate collaboration with colleagues?',
  'Describe your values / To what extent are your values aligned with our company culture?',
  'How do you react to unexpected changes?'
]

const set10 = [
  'What do you think is the most significant issue society is currently facing?',
  'Your manager asks you to work on the weekend. How does it make you feel?',
  'How do you define success?',
  'Does your current team consider you an approachable person?',
  'How do you maintain emotional balance in tough times?'
]


const questions = [set1, set2, set3, set4, set5, set6, set7, set8, set9, set10];

// update question
question.textContent = questions[set_number][counter];

console.log(questions[set_number][counter]);

// ----------------------------------------------------------------------------------

let timerInterval;
let secondsElapsed = 0;

let stopRecordingTimeout; // variable to hold the timeout

var StartTime;

// Function to start capturing video and audio
function startRecording() {
  // Clear previous timer
  clearInterval(timerInterval);
  secondsElapsed = 0;
  updateTimerDisplay();

  //previewVideo.src = '#';
  // Clear previous recording chunks
  recordedChunks = [];

  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);

  // Get video stream for live feed (without audio)
  navigator.mediaDevices.getUserMedia({ video: true, audio: false})
    .then(videoStream => {
      liveFeed.srcObject = videoStream;

      // Get combined stream for recording (audio and video)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(recordingStream => {

            // state recording
            recording = true;

            // color change to red
            startRecordingButton.style.backgroundColor = 'red';

          mediaRecorder = new MediaRecorder(recordingStream);

          mediaRecorder.onstop = function() {
            var duration = new Date().getTime() - StartTime;
            console.log(duration);

            // clear the previous recording preview
            const blob = new Blob(recordedChunks, { type: 'video/webm' });

            ysFixWebmDuration(blob, duration, {logger: false})
            .then(function(fixedBlob) {
                global_blob = fixedBlob;
                previewVideo.src = URL.createObjectURL(fixedBlob);
            });

            //global_blob = blob;

            //previewVideo.src = URL.createObjectURL(blob);
            clearInterval(timerInterval);
            updateTimerDisplay();

            // Release recording stream resources after stopping
            recordingStream.getTracks().forEach(track => track.stop());

          };

          // new loc
          mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
              recordedChunks.push(event.data);
            }
          };

          mediaRecorder.start();
          
          // start recording time
          StartTime = new Date().getTime();

          console.log('Recording started');

          startRecordingButton.textContent = 'Stop Recording';
          startRecordingButton.removeEventListener('click', startRecording);

          // Clear any existing timeout
          clearTimeout(stopRecordingTimeout);

          // time limit for recording is 2 minutes
           stopRecordingTimeout = setTimeout(() => {
                stopRecording();
            }, 60500);

          startRecordingButton.addEventListener('click', stopRecording);
        })
        .catch(error => {
          console.error('Error accessing recording stream:', error);
        });
    })
    .catch(error => {
      console.error('Error accessing video stream:', error);
    });
}

// Function to stop recording
function stopRecording() {    
  mediaRecorder.stop();
  startRecordingButton.textContent = 'Start Recording';
  startRecordingButton.removeEventListener('click', stopRecording);
  startRecordingButton.addEventListener('click', startRecording);

  // color change back to blue
  startRecordingButton.style.backgroundColor = '#007bff';

  // state recording
  recording = false;

  // Clear the timeout to prevent automatic stopping
  clearTimeout(stopRecordingTimeout);

  console.log('Recording stopped');
}

// Function to update timer display
function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Function to submit recording
// Function to submit recording
function submitRecording() {
  // Disable submit button and change its text to "Wait"
  submit.disabled = true;
  submit.textContent = 'Uploading...';

  //color change of submit button to green
  submit.style.backgroundColor = 'green';

  //block the start recording button
  startRecordingButton.disabled = true;

  console.log('Submitting recording...');

  // state recording not allowed to submit
  if (recording) {
      alert('Please stop recording before submitting');
      // Re-enable submit button and restore its text
      submit.disabled = false;
      submit.textContent = 'Submit';

      // color change of submit button to blue
      submit.style.backgroundColor = '#007bff';

      // Re-enable start recording button
      startRecordingButton.disabled = false;

      return;
  }

  // video available for submission, not empty
  if (recordedChunks.length === 0) {
      alert('Record your answer before submitting');
      // Re-enable submit button and restore its text
      submit.disabled = false;
      submit.textContent = 'Submit';

      // color change of submit button to blue
      submit.style.backgroundColor = '#007bff';

      // Re-enable start recording button
      startRecordingButton.disabled = false;
      return;
  }

  // Combine all recorded chunks into a single blob
  //const blob = new Blob(recordedChunks, { type: 'video/mp4' });
  const blob = global_blob;

  // convert blob to file
  const file = new File([blob], 'recording.webm', { type: 'video/webm' });

  // Create a FormData object to send the video blob
  const formData = new FormData();

  // random number new
  let rand = Math.floor(Math.random() * 100);

  file_name = set_number + "_" + counter + "_" + rand + randomNumber + ".webm";

  console.log(file_name);

  // API format video, folder_name, file_name
  formData.append('file', file);
  formData.append('folder_id', id);
  formData.append('file_name', file_name);

  // API endpoint
  const url = 'https://interview-hirevue-ae9c2f5fd450.herokuapp.com/upload';

  // Send the video blob to the server
  fetch(url, {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      console.log(data);

      if (data.message == "success") {
          alert('Recording submitted successfully');
          
          // increment the counter
          counter++;
          console.log(counter);
          localStorage.setItem('counter', counter);

          // if counter is 6, redirect to the next page
          if (counter === 6) {
              localStorage.removeItem('counter');
              localStorage.removeItem('set_number');
              // go to thank you page
              window.location.href = 'thankyou.html';
          }

          // update the question
          updateQuestion();

          // clear the preview video
          previewVideo.src = '#';
          recordedChunks = [];

          // clear the timer
          clearInterval(timerInterval);
          secondsElapsed = 0;

          // update timer display
          updateTimerDisplay();
      }

      else {
          alert('Error submitting recording, please try again! Reason: ' + data.message);
      }
  })
  // Error handling
  .catch(error => {
      console.error('Error:', error);
      alert('Error submitting recording');
  })
  .finally(() => {
      // Re-enable submit button and restore its text
      submit.disabled = false;
      submit.textContent = 'Submit';

      // color change of submit button to blue
      submit.style.backgroundColor = '#007bff';

      // Re-enable start recording button
      startRecordingButton.disabled = false;
  });
}

// function to update question
function updateQuestion() {
    // update question in the html
    question.textContent = questions[set_number][counter];
}

// Get live camera feed (without audio initially)
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    liveFeed.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing camera:', error);
  });

startRecordingButton.addEventListener('click', startRecording);
submit.addEventListener('click', submitRecording);
