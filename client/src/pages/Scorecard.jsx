import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { jsPDF } from 'jspdf';

export default function Scorecard() {
  const { transcriptId } = useParams();
  const [scorecard, setScorecard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const res = await api.get(`/scorecard/${transcriptId}`);
        setScorecard(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load scorecard');
      }
    };
    fetchScorecard();
  }, [transcriptId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading scorecard...</p>
      </div>
    );
  }

  const { scores, overallFeedback, strengths, areasToImprove, communicationMetrics  } = scorecard;

  const ScoreBar = ({ label, value }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-600 h-3 rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Interview Scorecard', 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const scoreLines = [
      `Communication: ${scores.communication}/10`,
      `Technical Accuracy: ${scores.technicalAccuracy}/10`,
      `Problem Solving: ${scores.problemSolving}/10`,
      `Confidence: ${scores.confidence}/10`,
    ];
    doc.setFont(undefined, 'bold');
    doc.text('Scores', 20, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    scoreLines.forEach((line) => {
      doc.text(line, 20, y);
      y += 6;
    });
    y += 4;

    if (communicationMetrics) {
      doc.setFont(undefined, 'bold');
      doc.text('Speaking Analysis', 20, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      doc.text(`Average Pace: ${communicationMetrics.avgWpm} WPM`, 20, y);
      y += 6;
      doc.text(`Filler Words: ${communicationMetrics.avgFillerWordsPerAnswer} per answer`, 20, y);
      y += 6;
      doc.text(`Long Pauses: ${communicationMetrics.totalPauses}`, 20, y);
      y += 6;
      doc.text(`Avg. Pause Time: ${communicationMetrics.avgPauseSeconds}s`, 20, y);
      y += 10;
    }

    doc.setFont(undefined, 'bold');
    doc.text('Overall Feedback', 20, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const feedbackLines = doc.splitTextToSize(overallFeedback, 170);
    doc.text(feedbackLines, 20, y);
    y += feedbackLines.length * 6 + 6;

    doc.setFont(undefined, 'bold');
    doc.text('Strengths', 20, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    strengths.forEach((s) => {
      const lines = doc.splitTextToSize(`- ${s}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6;
    });
    y += 6;

    doc.setFont(undefined, 'bold');
    doc.text('Areas to Improve', 20, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    areasToImprove.forEach((a) => {
      const lines = doc.splitTextToSize(`- ${a}`, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6;
    });

    doc.save('PrepForge_Scorecard.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Interview Scorecard</h1>

        <ScoreBar label="Communication" value={scores.communication} />
        <ScoreBar label="Technical Accuracy" value={scores.technicalAccuracy} />
        <ScoreBar label="Problem Solving" value={scores.problemSolving} />
        <ScoreBar label="Confidence" value={scores.confidence} />

        {communicationMetrics && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h2 className="font-bold text-sm text-gray-600 mb-2">Speaking Analysis</h2>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>Avg. Pace: <span className="font-semibold">{communicationMetrics.avgWpm} WPM</span></div>
              <div>Filler Words: <span className="font-semibold">{communicationMetrics.avgFillerWordsPerAnswer}/answer</span></div>
              <div>Long Pauses: <span className="font-semibold">{communicationMetrics.totalPauses}</span></div>
              <div>Avg. Pause Time: <span className="font-semibold">{communicationMetrics.avgPauseSeconds}s</span></div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2">Overall Feedback</h2>
          <p className="text-gray-700">{overallFeedback}</p>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2 text-green-700">Strengths</h2>
          <ul className="list-disc list-inside text-gray-700">
            {strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-2 text-orange-700">Areas to Improve</h2>
          <ul className="list-disc list-inside text-gray-700">
            {areasToImprove.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>

        <Link
          to="/dashboard"
          className="block text-center mt-8 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
        <button
          onClick={downloadPDF}
          className="w-full mt-8 bg-gray-800 text-white p-2 rounded hover:bg-gray-900"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}