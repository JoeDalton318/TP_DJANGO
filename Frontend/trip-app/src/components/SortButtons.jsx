import { ButtonGroup, Button } from 'react-bootstrap';

export default function SortButtons({ currentSort, onSortChange }) {
  const sorts = [
    { value: '', label: 'Aucun tri' },
    { value: 'budget_asc', label: 'Budget ↑' },
    { value: 'budget_desc', label: 'Budget ↓' },
    { value: 'distance', label: 'Distance optimale' }
  ];

  return (
    <ButtonGroup className="mb-3">
      {sorts.map(({ value, label }) => (
        <Button
          key={value}
          variant={currentSort === value ? 'primary' : 'outline-primary'}
          onClick={() => onSortChange(value)}
        >
          {label}
        </Button>
      ))}
    </ButtonGroup>
  );
}