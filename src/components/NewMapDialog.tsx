import { useState } from 'react';

interface NewMapDialogProps {
  onCreate: (width: number, height: number) => void;
  onClose: () => void;
}

const PRESETS = [
  { label: '15 × 15', width: 15, height: 15 },
  { label: '20 × 20', width: 20, height: 20 },
  { label: '30 × 30', width: 30, height: 30 },
];

export function NewMapDialog({ onCreate, onClose }: NewMapDialogProps) {
  const [width, setWidth] = useState(15);
  const [height, setHeight] = useState(15);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (width < 1 || height < 1 || width > 200 || height > 200) {
      setError('Dimensions must be between 1 and 200');
      return;
    }

    onCreate(width, height);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose} role="presentation">
      <div
        className="dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="new-map-title"
      >
        <h2 id="new-map-title" className="dialog__title">
          Create New Map
        </h2>

        <form className="dialog__form" onSubmit={handleSubmit}>
          <div className="dialog__presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn"
                onClick={() => {
                  setWidth(preset.width);
                  setHeight(preset.height);
                  setError(null);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="dialog__fields">
            <label className="dialog__label">
              Width
              <input
                type="number"
                min={1}
                max={200}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </label>
            <label className="dialog__label">
              Height
              <input
                type="number"
                min={1}
                max={200}
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
              />
            </label>
          </div>

          {error && <p className="dialog__error">{error}</p>}

          <div className="dialog__actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
