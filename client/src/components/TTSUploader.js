// src/components/TTSUploader.js
import React, { useState, useRef } from 'react';

function TTSUploader() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  //const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setFileName(selectedFile.name.replace(/\.[^/.]+$/, '')); // Remove extension
    setStep(2);
    setText('');
    setAudioUrl('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    //setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'TTS failed');
      }

      setText(data.text);
      setAudioUrl(`http://localhost:5000${data.audioUrl}`);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(step > 1 ? step - 1 : 1);

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setFileName('');
    setText('');
    setAudioUrl('');
   // setProgress(0);
    setError('');
  };

  const forceDownload = async () => {
    const blob = await fetch(audioUrl).then(res => res.blob());
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="tts-card-wrapper">
      <div className="tts-card">
        <div className="stepper">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`circle ${step >= s ? 'active' : ''}`}>
              {s}
            </div>
          ))}
        </div>
        {step === 1 && (
          <>
            <h2>Upload Document</h2>
            <div
              className="drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <p>📄 Drag & drop a file here, or click to browse</p>
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Generate Audio</h2>
            <p>Click below to convert your text to speech.</p>
            <button className="primary" onClick={handleUpload} disabled={loading}>
              {loading ? 'Processing...' : 'Generate Audio'}
            </button>
            {loading && (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Converting to audio...</p>
              </div>
            )}
            {error && <p className="error">{error}</p>}
            <br />
            <button className="secondary" onClick={handleBack}>⬅️ Back</button>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Result</h2>
            <textarea value={text} readOnly />
            {audioUrl && (
              <div>
                <h2>Click to play</h2>
                <p>You can play it or download it — your choice</p>
                <audio controls src={audioUrl}></audio>
                <br />
                <button className="primary" onClick={forceDownload}>⬇️ Download Audio</button>
                <br /><br />
                <button className="secondary" onClick={handleReset}>🔁 Upload New File</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TTSUploader;
