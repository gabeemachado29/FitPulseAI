import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Sparkles, Trash2, RefreshCw, Layers, Edit3, Info } from 'lucide-react';
import Button from '../ui/Button';
import styles from './MultimodalScannerInput.module.css';

export default function MultimodalScannerInput({
  onAnalyze,
  loading = false,
  initialPhoto = null,
  initialText = '',
}) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [photo, setPhoto] = useState(initialPhoto);
  const [photoFile, setPhotoFile] = useState(null);
  const [text, setText] = useState(initialText);
  const [isFocused, setIsFocused] = useState(false);

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const hasPhoto = Boolean(photo);
    const hasText = Boolean(text.trim());

    if (!hasPhoto && !hasText) return;

    onAnalyze({
      imageFile: photoFile,
      imageBase64: photo,
      textDescription: text.trim(),
    });
  };

  const hasPhoto = Boolean(photo);
  const hasText = Boolean(text.trim());
  const canAnalyze = (hasPhoto || hasText) && !loading;

  // Determine current multimodal state
  let modeBadgeText = 'Aguardando entrada';
  let modeBadgeClass = styles.modeBadgeDefault;
  let modeBadgeIcon = Layers;

  if (hasPhoto && hasText) {
    modeBadgeText = 'Modo Híbrido: Foto + Observações';
    modeBadgeClass = styles.modeBadgeHybrid;
    modeBadgeIcon = Sparkles;
  } else if (hasPhoto) {
    modeBadgeText = 'Modo Foto (Visão Computacional)';
    modeBadgeClass = styles.modeBadgeActive;
    modeBadgeIcon = Camera;
  } else if (hasText) {
    modeBadgeText = 'Modo Texto (Descrição de Prato)';
    modeBadgeClass = styles.modeBadgeActive;
    modeBadgeIcon = Edit3;
  }

  const ModeIcon = modeBadgeIcon;

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="sr-only"
        aria-label="Tirar foto com a câmera"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileSelected}
        className="sr-only"
        aria-label="Escolher imagem da galeria"
      />

      {/* Mode Indicator Header */}
      <div className={styles.modeHeader}>
        <div className={`${styles.modeBadge} ${modeBadgeClass}`}>
          <ModeIcon size={14} />
          <span>{modeBadgeText}</span>
        </div>
        <span className={styles.modeHint}>
          {hasPhoto && hasText
            ? 'A IA analisará a foto com prioridade nas suas notas'
            : hasPhoto
            ? 'Foto selecionada'
            : hasText
            ? 'Texto pronto para cálculo'
            : 'Foto, texto ou ambos'}
        </span>
      </div>

      {/* Photo Section: Preview or Upload Buttons */}
      <div className={styles.photoSection}>
        {hasPhoto ? (
          <div className={styles.previewContainer}>
            <img src={photo} alt="Prévia da Refeição" className={styles.previewImg} />
            <div className={styles.previewControls}>
              <button
                type="button"
                className={styles.controlBtn}
                onClick={() => cameraInputRef.current?.click()}
                title="Trocar por outra foto"
              >
                <RefreshCw size={14} />
                <span>Trocar foto</span>
              </button>
              <button
                type="button"
                className={`${styles.controlBtn} ${styles.removeBtn}`}
                onClick={handleRemovePhoto}
                title="Remover foto"
              >
                <Trash2 size={14} />
                <span>Remover foto</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.uploadGrid}>
            <div
              className={styles.uploadCard}
              onClick={() => cameraInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className={styles.iconWrap}>
                <Camera size={26} />
              </div>
              <span className={styles.cardTitle}>Tirar foto</span>
              <span className={styles.cardSubtitle}>Câmera do aparelho</span>
            </div>

            <div
              className={styles.uploadCard}
              onClick={() => galleryInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className={styles.iconWrap}>
                <ImageIcon size={26} />
              </div>
              <span className={styles.cardTitle}>Galeria</span>
              <span className={styles.cardSubtitle}>Escolher imagem salva</span>
            </div>
          </div>
        )}
      </div>

      {/* Text / Observations Section */}
      <div className={`${styles.textSection} ${isFocused ? styles.textSectionFocused : ''}`}>
        <div className={styles.textHeader}>
          <Edit3 size={16} className={styles.textIcon} />
          <span>
            {hasPhoto
              ? 'Observações sobre a foto (ingredientes ocultos, modo de preparo)'
              : 'Descreva sua refeição ou ingredientes'}
          </span>
        </div>

        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            hasPhoto
              ? 'Ex: "Usei 1 colher de manteiga no preparo", "o molho é barbecue", "carne frita no azeite", "leite desnatado"...'
              : 'Ex: 1 concha de feijão carioca, 4 colheres de sopa de arroz branco, 150g de filé de frango grelhado e salada verde...'
          }
          rows={hasPhoto ? 3 : 4}
        />

        <div className={styles.textFooter}>
          <span className={styles.textNote}>
            <Info size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            {hasPhoto
              ? 'Ingredientes digitados têm prioridade sobre a visão da câmera.'
              : 'Informe quantidades ou medidas caseiras para maior precisão.'}
          </span>
          {text.length > 0 && (
            <span className={styles.charCount}>{text.length} caracteres</span>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          icon={Sparkles}
          loading={loading}
          disabled={!canAnalyze}
          className={styles.analyzeButton}
        >
          {loading
            ? 'Processando com IA...'
            : hasPhoto && hasText
            ? 'Analisar Foto + Observações'
            : hasPhoto
            ? 'Analisar Foto com IA'
            : hasText
            ? 'Calcular Nutrientes do Texto'
            : 'Selecione uma foto ou digite a refeição'}
        </Button>
      </div>
    </form>
  );
}
