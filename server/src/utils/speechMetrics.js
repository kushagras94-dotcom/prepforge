const FILLER_WORDS = ['um', 'umm', 'uh', 'uhh', 'erm', 'er', 'hmm'];
const FILLER_PHRASE = 'you know';
const PAUSE_THRESHOLD_SECONDS = 1.2;

const computeSpeechMetrics = (words) => {
  if (!words || words.length === 0) {
    return {
      wordCount: 0,
      durationSeconds: 0,
      wpm: 0,
      fillerWordCount: 0,
      pauseCount: 0,
      totalPauseSeconds: 0,
      longestPauseSeconds: 0,
    };
  }

  const durationSeconds = words[words.length - 1].end - words[0].start;
  const wordCount = words.length;
  const wpm = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;

  const fullText = words.map((w) => w.word.toLowerCase().replace(/[^a-z']/g, '')).join(' ');
  let fillerWordCount = 0;
  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'g');
    const matches = fullText.match(regex);
    if (matches) fillerWordCount += matches.length;
  });
  const phraseMatches = fullText.match(new RegExp(FILLER_PHRASE, 'g'));
  if (phraseMatches) fillerWordCount += phraseMatches.length;

  let pauseCount = 0;
  let totalPauseSeconds = 0;
  let longestPauseSeconds = 0;
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].start - words[i - 1].end;
    if (gap > PAUSE_THRESHOLD_SECONDS) {
      pauseCount += 1;
      totalPauseSeconds += gap;
      if (gap > longestPauseSeconds) longestPauseSeconds = gap;
    }
  }

  return {
    wordCount,
    durationSeconds: Math.round(durationSeconds * 10) / 10,
    wpm,
    fillerWordCount,
    pauseCount,
    totalPauseSeconds: Math.round(totalPauseSeconds * 10) / 10,
    longestPauseSeconds: Math.round(longestPauseSeconds * 10) / 10,
  };
};

module.exports = { computeSpeechMetrics };