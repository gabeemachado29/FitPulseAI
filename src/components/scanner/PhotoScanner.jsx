import MultimodalScannerInput from './MultimodalScannerInput';

export default function PhotoScanner({ onAnalyzePhoto, loading }) {
  const handleAnalyze = ({ imageBase64, imageFile, textDescription }) => {
    if (onAnalyzePhoto) {
      onAnalyzePhoto(imageBase64, 'image/jpeg', textDescription);
    }
  };

  return <MultimodalScannerInput onAnalyze={handleAnalyze} loading={loading} />;
}
