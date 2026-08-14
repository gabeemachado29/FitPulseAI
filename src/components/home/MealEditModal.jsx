import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import styles from './MealEditModal.module.css';

export default function MealEditModal({
  isOpen,
  meal,
  onSave,
  onClose,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    if (meal) {
      setFormData({
        description: meal.description || meal.name || '',
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0,
      });
    }
  }, [meal]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(meal.id, {
      description: formData.description,
      name: formData.description,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
    });
  };

  if (!meal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Refeição"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nome / Descrição"
          id="meal-description"
          value={formData.description}
          onChange={(val) => handleChange('description', val)}
          placeholder="Ex: Almoço reforçado"
          required
        />

        <Input
          label="Calorias Totais"
          id="meal-calories"
          type="number"
          value={formData.calories}
          onChange={(val) => handleChange('calories', val)}
          suffix="kcal"
          min="0"
          required
        />

        <div className={styles.grid}>
          <Input
            label="Proteína"
            id="meal-protein"
            type="number"
            value={formData.protein}
            onChange={(val) => handleChange('protein', val)}
            suffix="g"
            min="0"
          />

          <Input
            label="Carboidratos"
            id="meal-carbs"
            type="number"
            value={formData.carbs}
            onChange={(val) => handleChange('carbs', val)}
            suffix="g"
            min="0"
          />
        </div>

        <Input
          label="Gordura"
          id="meal-fat"
          type="number"
          value={formData.fat}
          onChange={(val) => handleChange('fat', val)}
          suffix="g"
          min="0"
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            icon={X}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            icon={Check}
            loading={loading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}
