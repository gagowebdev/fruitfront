// import React from 'react';

type ProgressBarProps = {
  progress: number; // % заполнения (0-100)
};

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default ProgressBar;
