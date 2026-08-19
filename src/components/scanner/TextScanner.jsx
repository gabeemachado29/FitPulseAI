import MultimodalScannerInput from './MultimodalScannerInput';

export default function TextScanner({ onAnalyzeText, loading }) {
  const handleAnalyze = ({ textDescription }) => {
    if (onAnalyzeText) {
      onAnalyzeText(textDescription);
    }
  };

  return <MultimodalScannerInput onAnalyze={handleAnalyze} loading={loading} />;
}
