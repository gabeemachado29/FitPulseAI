import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import styles from './PhotoScanner.module.css';

export default function PhotoScanner({ onAnalyzePhoto, loading }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setSelectedImage(base64);
      onAnalyzePhoto(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.container}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
      />

      {/* Photo Drop / Preview Area */}
      <div
        className={styles.dropZone}
        onClick={() => cameraInputRef.current?.click()}
      >
        {selectedImage ? (
          <div className={styles.previewWrap}>
            <img src={selectedImage} alt="Refeição" className={styles.previewImage} />
            <div className={styles.overlayText}>Trocar foto</div>
          </div>
        ) : (
          <div className={styles.dropContent}>
            <div className={styles.iconCircle}>
              <Camera size={32} className={styles.cameraIcon} />
            </div>
            <span className={styles.zoneTitle}>Tirar foto</span>
            <span className={styles.zoneSubtitle}>Abre a câmera</span>
          </div>
        )}
      </div>

      {/* Gallery Button */}
      <Button
        variant="secondary"
        fullWidth
        icon={ImageIcon}
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        Escolher da galeria
      </Button>
    </div>
  );
}
