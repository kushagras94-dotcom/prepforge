const LEVELS = ['Easy', 'Medium', 'Hard'];

function adjustDifficulty(transcript, performance) {
  if (!transcript.performanceStreak) {
    transcript.performanceStreak = { struggles: 0, excels: 0 };
  }

  if (performance === 'excelled') {
    transcript.performanceStreak.excels += 1;
    transcript.performanceStreak.struggles = 0;
  } else if (performance === 'struggled') {
    transcript.performanceStreak.struggles += 1;
    transcript.performanceStreak.excels = 0;
  } else {
    transcript.performanceStreak.excels = 0;
    transcript.performanceStreak.struggles = 0;
  }

  const currentIndex = LEVELS.indexOf(transcript.difficulty);

  if (transcript.performanceStreak.excels >= 2 && currentIndex < LEVELS.length - 1) {
    transcript.difficulty = LEVELS[currentIndex + 1];
    transcript.performanceStreak.excels = 0;
  } else if (transcript.performanceStreak.struggles >= 2 && currentIndex > 0) {
    transcript.difficulty = LEVELS[currentIndex - 1];
    transcript.performanceStreak.struggles = 0;
  }
}

module.exports = { adjustDifficulty };