import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const TagBadge = ({tag}) => (
  <span className="bg-blue-600 text-white px-3 py-1 text-sm rounded-full">
    #{ tag}
  </span>
);

const AnswerCard = ({ text, votes, onVote, hasVoted }) => (
  <div className="bg-gray-700 p-4 rounded text-white flex items-center justify-between">
    <p className="flex-1">{text}</p>
    <div className="flex items-center ml-4">
      <button
        onClick={onVote}
        disabled={hasVoted}
        className={`flex items-center px-3 py-1 rounded transition border-2 border-yellow-400 shadow-lg text-lg font-semibold ${hasVoted ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600 hover:bg-yellow-400 hover:text-gray-900'}`}
        title={hasVoted ? 'You have already voted' : 'Vote for this answer'}
        style={{ minWidth: '70px' }}
      >
        <span style={{fontSize: '1.7rem', marginRight: '0.5rem'}}>{hasVoted ? '★' : '☆'}</span>
        <span className="mr-1">{votes}</span>
        <span className="text-xs font-bold uppercase tracking-wide">Vote</span>
      </button>
    </div>
  </div>
);

export default function Answers() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({}); // { answerIdx: voteCount }
  const [voted, setVoted] = useState({}); // { answerIdx: true }

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/getQuestion/${id}`);
        const data = await res.json();
        console.log("Fetched question:", data);

        data.answers = Array.isArray(data.answers) ? data.answers : [];
        setQuestion(data);

        // Initialize votes from answer data (if available)
        const initialVotes = {};
        data.answers.forEach((ans, idx) => {
          // Try to get vote count from ans.votes or ans.voteCount or default 0
          initialVotes[idx] = ans.votes || ans.voteCount || 0;
        });
        setVotes(initialVotes);

        // Load voted state from sessionStorage (per user, per question)
        const votedKey = `voted_answers_${id}`;
        const votedFromStorage = JSON.parse(sessionStorage.getItem(votedKey) || '{}');
        setVoted(votedFromStorage);
      } catch (err) {
        console.error("Error fetching question:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  // Handle voting for an answer (calls backend)
  const handleVote = async (answerId, answerIdx) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/vote/${answerId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setVotes((prev) => ({ ...prev, [answerIdx]: data.voteCount }));
        setVoted((prev) => {
          const updated = { ...prev, [answerIdx]: true };
          const votedKey = `voted_answers_${id}`;
          sessionStorage.setItem(votedKey, JSON.stringify(updated));
          return updated;
        });
      } else {
        alert(data.msg || "Vote failed");
      }
    } catch (err) {
      alert("Vote failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-white">
      <Navbar />

      <div className="flex justify-center px-4">
        <div className="w-full max-w-4xl min-h-[300px] border border-white p-6 rounded">
          {loading ? (
            <p>Loading...</p>
          ) : question && question.title ? (
            <div>
              <h1 className="text-2xl font-bold mb-2">{question.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags?.length > 0 ? (
                  question.tags.map((tag, index) => (
                    <TagBadge key={index} tag={tag} />
                  ))
                ) : (
                  <span className="text-gray-400 italic">No tags</span>
                )}
              </div>

              <p className="text-gray-300 mb-6">
                {question.description || "No description available."}
              </p>

              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Answers</h2>

                {Array.isArray(question.answers) && question.answers.length > 0 ? (
                  <div className="space-y-4">
                    {question.answers.map((ans, idx) => (
                      <AnswerCard
                        key={ans.id || idx}
                        text={ans.content || ans.text || ans}
                        votes={votes[idx] || 0}
                        hasVoted={!!voted[idx]}
                        onVote={() => handleVote(ans.id, idx)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No answers yet. Be the first to answer!</p>
                )}
              </div>
            </div>
          ) : (
            <p>Question not found or invalid data.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => window.history.back()}
          className="m-10 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
        >
          ← Back to questions
        </button>
      </div>
    </div>
  );
}