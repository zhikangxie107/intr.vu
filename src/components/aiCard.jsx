import { useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

export default function AICard() {
  const [listening, setListening] = useState(false);
  const toggleMic = () => setListening(!listening);

  return (
    <>
      <div className="ai-card">
        <div className="ai-content">
          <img
            src="https://i.pravatar.cc/150?img=3"
            alt="AI Avatar"
            className="ai-avatar"
          />
          <h3 className="ai-name">Mark</h3>
          <button
            className={`mic-button ${listening ? 'active' : ''}`}
            onClick={toggleMic}
          >
            {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </div>
      </div>

      <style>{css}</style>
    </>
  );
}

const css = `
.ai-card {
  flex: 0 0 100%;
  height: 38vh; 
  background: linear-gradient(180deg, #f6f8fb 0%, #f1f3f6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  box-sizing: border-box;
  width: 100%; 
  transition: all 0.3s ease;
}

.ai-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: clamp(90px, 12vw, 120px);
  height: clamp(90px, 12vw, 120px);
  border-radius: 50%;
  object-fit: cover;
}

.ai-name {
  font-size: clamp(1rem, 1.4vw, 1.3rem);
  font-weight: 600;
  color: #222;
}

.mic-button {
  background-color: #eaeaea;
  border: none;
  width: clamp(42px, 4vw, 52px);
  height: clamp(42px, 4vw, 52px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 2vw, 20px);
  cursor: pointer;
  color: #333;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.mic-button:hover {
  background-color: #ddd;
}

.mic-button.active {
  background-color: #ff4d4f;
  color: white;
}
`;
