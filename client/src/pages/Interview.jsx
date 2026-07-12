import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

export default function Interview() {
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [transcriptId, setTranscriptId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { targetRole, targetCompany: targetCompany || undefined , difficulty });
      setTranscriptId(res.data.transcriptId);
      setQuestion(res.data.question);
      setHistory([{ role: 'interviewer', content: res.data.question }]);
      setStarted(true);
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
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit answer');
    }
    setLoading(false);
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
        <h1 className="text-2xl font-bold mb-4">Mock Interview — {targetRole}</h1>

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
            </div>
          ))}
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full border p-3 rounded-lg mb-3 h-28"
        />

        <div className="flex gap-3">
          <button
            onClick={submitAnswer}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Submit Answer'}
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