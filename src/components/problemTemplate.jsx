export default function ProblemTemplate({ title, description, examples, constraints }) {
  return (
    <>
      <div className="problem-container">
        <h1 className="problem-title">{title}</h1>

        {/* Description */}
        {description && description.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        {/* Examples */}
        {examples && examples.length > 0 && (
          <div className="example">
            {examples.map((ex, i) => (
              <div key={i} className="example-block">
                <p><strong>Example {i + 1}:</strong></p>
                <div className="indent">
                  {ex.input && <p><strong>Input:</strong> {ex.input}</p>}
                  {ex.output && <p><strong>Output:</strong> {ex.output}</p>}
                  {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Constraints */}
        {constraints && constraints.length > 0 && (
          <div className="constraints">
            <strong>Constraints:</strong>
            <ul>
              {constraints.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <style>{css}</style>
    </>
  );
}

const css = `
.problem-container {
  width: 100%;
  max-width: 640px;
  background: transparent;
  border: none;
  box-shadow: none; 
  padding: 0; 
  color: #1f1f1f;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  overflow-wrap: break-word;
}

.problem-title {
  font-size: clamp(1.2rem, 2vw, 1.6rem);
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.problem-container p {
  margin-bottom: 0.8rem;
  font-size: clamp(0.85rem, 1vw, 1rem);
  color: #2c2c2c;
}

.example {
  margin-top: 1.2rem;
  margin-bottom: 1.2rem;
}

.example-block {
  margin-bottom: 1rem;
}

.indent {
  margin-left: 1rem;
}

.constraints {
  font-size: clamp(0.85rem, 1vw, 1rem);
  color: #333;
}

.constraints ul {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.constraints li {
  position: relative;
  margin-bottom: 0.3rem;
  padding-left: 0.8rem;
}

.constraints li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #9ca3af;
}
`;
