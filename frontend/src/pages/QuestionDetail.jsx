
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TextEditor from '../components/TextEditor';

export default function QuestionDetail() {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Voting state for answers
    const [votes, setVotes] = useState({}); // { answerIdx: voteCount }
    const [voted, setVoted] = useState({}); // { answerIdx: true }

    // Debug logging
    console.log('Question ID from params:', id);
    console.log('All params:', useParams());

    useEffect(() => {
        if (id) {
            fetchQuestionDetails();
        } else {
            setError('Question ID is missing from URL');
            setLoading(false);
        }
    }, [id]);

    const fetchQuestionDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Please login to view answers");
            }

            console.log('Fetching question with ID:', id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/question/getQuestions/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to fetch question details');
            }
            const data = await response.json();
            console.log('Question data:', data);
            setQuestion(data);
            setAnswers(data.answers || []);
            // Initialize votes from answer data (if available)
            const initialVotes = {};
            (data.answers || []).forEach((ans, idx) => {
                initialVotes[idx] = ans.votes || ans.voteCount || 0;
            });
            setVotes(initialVotes);
            // Load voted state from sessionStorage (per user, per question)
            const votedKey = `voted_answers_${id}`;
            const votedFromStorage = JSON.parse(sessionStorage.getItem(votedKey) || '{}');

            setVoted(votedFromStorage);
        } catch (err) {
            console.error('Error fetching question:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Please login to submit an answer');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/ans/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: answer.trim(),
                    questionId: id
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to submit answer');
            }

            // Refresh the question details to show the new answer
            await fetchQuestionDetails();
            setAnswer(''); // Clear the answer input
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show error if no ID is found
    if (!id) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-xl">
                        Error: Question ID is missing from the URL. Please check your route configuration.
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {question && (
                    <>
                        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 border border-gray-700/50">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-2xl font-bold">{question.title}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">
                                        Asked {new Date(question.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none mb-4">
                                {question.description}
                            </div>

                            <div className="flex gap-2">
                                {question.tags?.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="text-xs bg-gray-700/50 px-2 py-1 rounded-md"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">
                                {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                            </h2>

                            <div className="space-y-6">
                                {answers.map((answer, index) => (
                                    <div
                                        key={answer.id || index}
                                        className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="prose prose-invert max-w-none mb-4">
                                                {answer.content}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Answered by {answer.user?.username || 'Anonymous'} on{' '}
                                                {new Date(answer.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center ml-4">
                                            <button
                                                onClick={() => handleVote(answer.id, index)}
                                                disabled={!!voted[index]}
                                                className={`flex items-center px-3 py-1 rounded transition border-2 border-yellow-400 shadow-lg text-lg font-semibold ${voted[index] ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600 hover:bg-yellow-400 hover:text-gray-900'}`}
                                                title={voted[index] ? 'You have already voted' : 'Vote for this answer'}
                                                style={{ minWidth: '70px' }}
                                            >
                                                <span style={{fontSize: '1.7rem', marginRight: '0.5rem'}}>{voted[index] ? '★' : '☆'}</span>
                                                <span className="mr-1">{typeof votes[index] === 'number' && !isNaN(votes[index]) ? votes[index] : 0}</span>
                                                <span className="text-xs font-bold uppercase tracking-wide">Vote</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-semibold mb-4">Your Answer</h2>
                            <form onSubmit={handleSubmitAnswer} className="space-y-4">
                                <div className="w-full bg-gray-800/50 border border-gray-700 rounded-xl 
                            focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50
                            overflow-hidden">
                                    <TextEditor
                                        onSave={setAnswer}
                                        initialContent=""
                                        className="min-h-[200px] p-4"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 
                         transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? "Posting..." : "Post Answer"}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}