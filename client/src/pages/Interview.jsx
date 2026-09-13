import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const VOICES = [
  { id: 'shubh', label: 'Shubh (Energetic, Male)' },
  { id: 'priya', label: 'Priya (Female)' },
  { id: 'rahul', label: 'Rahul (Male)' },
  { id: 'shruti', label: 'Shruti (Female)' },
];

export default function Interview() {
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [useResume, setUseResume] = useState(false);
  const [transcriptId, setTranscriptId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState(VOICES[0].id);
  const [muted, setMuted] = useState(false);
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);

  const speak = async (text) => {
    if (muted) return;
    try {
      const res = await api.post(
        '/tts/speak',
        { text, voice: selectedVoiceId },
        { responseType: 'blob' }
      );
      const audioUrl = URL.createObjectURL(res.data);
      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audioEl = new Audio(audioUrl);
      currentAudioRef.current = audioEl;
      audioEl.play();
    } catch (err) {
      console.error('TTS playback failed:', err.message);
    }
  };

  const previewVoice = async (voiceId) => {
    try {
      const res = await api.post(
        '/tts/speak',
        { text: "Hi, I'll be conducting your mock interview today.", voice: voiceId },
        { responseType: 'blob' }
      );
      const audioUrl = URL.createObjectURL(res.data);
      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audioEl = new Audio(audioUrl);
      currentAudioRef.current = audioEl;
      audioEl.play();
    } catch (err) {
      console.error('Voice preview failed:', err.message);
    }
  };

  const toggleMute = () => {
    if (!muted && currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    setMuted((m) => !m);
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { targetRole, targetCompany: targetCompany || undefined, difficulty, useResume });
      setTranscriptId(res.data.transcriptId);
      setQuestion(res.data.question);
      setHistory([{ role: 'interviewer', content: res.data.question }]);
      setStarted(true);
      speak(res.data.question);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start interview');
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/interview/${transcriptId}/answer`, { answer });
      setHistory((prev) => [
        ...prev,
        { role: 'candidate', content: answer },
        { role: 'interviewer', content: res.data.question },
      ]);
      setQuestion(res.data.question);
      setAnswer('');
      speak(res.data.question);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer');
    }
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceAnswer(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access is required for voice answers. Please allow mic permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadVoiceAnswer = async (audioBlob) => {
    setProcessingVoice(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'answer.webm');

      const res = await api.post(`/interview/${transcriptId}/answer-voice`, formData);
      const { question: nextQuestion, transcribedText, speechMetrics } = res.data;

      setHistory((prev) => [
        ...prev,
        { role: 'candidate', content: transcribedText, speechMetrics },
        { role: 'interviewer', content: nextQuestion },
      ]);
      setQuestion(nextQuestion);
      speak(nextQuestion);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process voice answer');
    }
    setProcessingVoice(false);
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      await api.post(`/interview/${transcriptId}/end`);
      navigate(`/scorecard/${transcriptId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end interview');
    }
    setLoading(false);
  };

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6">Start a Mock Interview</h1>
          <label className="block text-sm text-gray-600 mb-1">Target Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          />
          <label className="block text-sm text-gray-600 mb-1">Target Company (optional)</label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="e.g. Google, TCS, Amazon"
            className="w-full border p-2 rounded mb-4"
          />
          <label className="block text-sm text-gray-600 mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full border p-2 rounded mb-4"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <label className="block text-sm text-gray-600 mb-1">Interviewer Voice</label>
          <div className="flex gap-2 mb-4">
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="flex-1 border p-2 rounded"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => previewVoice(selectedVoiceId)}
              className="px-3 border rounded hover:bg-gray-50"
            >
              🔊
            </button>
          </div>

          <label className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={useResume}
              onChange={(e) => setUseResume(e.target.checked)}
            />
            Tailor questions using my uploaded resume
          </label>
          <button
            onClick={startInterview}
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mock Interview — {targetRole}</h1>
          <button
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              muted ? 'bg-gray-300 text-gray-700' : 'bg-gray-800 text-white'
            }`}
          >
            {muted ? '🔇 Unmute Interviewer' : '🔊 Mute Interviewer'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4 max-h-96 overflow-y-auto space-y-4">
          {history.map((msg, i) => (
            <div key={i} className={msg.role === 'interviewer' ? 'text-left' : 'text-right'}>
              <span
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.role === 'interviewer' ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white'
                }`}
              >
                {msg.content}
              </span>
              {msg.speechMetrics && (
                <div className="text-xs text-gray-400 mt-1">
                  {msg.speechMetrics.wpm} WPM · {msg.speechMetrics.fillerWordCount} filler words ·{' '}
                  {msg.speechMetrics.pauseCount} long pauses
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading || processingVoice}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                recording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              } disabled:opacity-50`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${recording ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
              {recording ? 'Stop Recording' : '🎤 Record Answer'}
            </button>
            {processingVoice && <span className="text-sm text-gray-500">Transcribing your answer...</span>}
          </div>

          <p className="text-xs text-gray-400 mb-2">Or type your answer instead:</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full border p-3 rounded-lg mb-3 h-28"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={submitAnswer}
            disabled={loading || recording || processingVoice}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Submit Typed Answer'}
          </button>
          <button
            onClick={endInterview}
            disabled={loading}
            className="bg-red-500 text-white px-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}