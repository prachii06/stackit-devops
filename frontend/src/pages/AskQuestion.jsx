import React, { useState } from "react";
import Navbar from "../components/Navbar";
import TextEditor from "../components/TextEditor";
import { useNavigate } from "react-router-dom";

export default function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please login to ask a question");
      }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/question/askQuestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags: tags.split(",")
                   .map(tag => tag.trim())
                   .filter(tag => tag.length > 0)
        })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response from server");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Question submission failed");
      }
      
      console.log("Response data:", data); // Debug log to see the actual response
      
      // Check for different possible ID field names
      const questionId = data.id || data._id || data.questionId || data.question?.id;
      
      if (questionId) {
        // Navigate to the question detail page
        navigate(`/question/${questionId}`);
      } else {
        // If no ID is found, log the response and show error
        console.error("No question ID found in response:", data);
        setError("Question posted but couldn't redirect. Please check your questions list.");
        // Optionally redirect to home or questions list
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      // Handle HTML error responses
      if (err.message.startsWith("<!DOCTYPE html>")) {
        setError("Server error occurred. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title*
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's your question?"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description*
            </label>
            <div className="w-full bg-gray-800 border border-gray-700 rounded-md 
                          focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
              <TextEditor 
                onSave={(content) => setDescription(content)}
                initialContent={description}
                className="min-h-[200px] p-4"
              />
            </div>
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags* (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="javascript, react, nodejs"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white 
                      font-medium py-2.5 px-6 rounded-md transition disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Question"}
          </button>
        </form>
      </div>
    </div>
  );
}