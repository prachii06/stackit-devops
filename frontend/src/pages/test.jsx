import React, { useState } from 'react';
import TextEditor from '../components/TextEditor';

export default function Test() {
  const [savedData, setSavedData] = useState(null);

  const handleEditorSave = (data) => {
    setSavedData(data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
        <TextEditor onSave={handleEditorSave} />
    </div>
  );
}
