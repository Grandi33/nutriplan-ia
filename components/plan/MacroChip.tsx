import { cn } from '@/lib/utils';

type MacroTipo = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fibra';

const config: Record<
  MacroTipo,
  { label: string; unidad: string; chip: string }
> = {
  kcal: { label: 'kcal', unidad: '', chip: 'bg-kcal/15 text-kcal' },
  protein: { label: 'Prot', unidad: 'g', chip: 'bg-protein/15 text-protein' },
  carbs: { label: 'Carb', unidad: 'g', chip: 'bg-carbs/15 text-carbs' },
  fat: { label: 'Grasa', unidad: 'g', chip: 'bg-fat/15 text-fat' },
  fibra: { label: 'Fibra', unidad: 'g', chip: 'bg-primary-soft text-primary' },
};

export function MacroChip({
  tipo,
  valor,
  className,
}: {
  tipo: MacroTipo;
  valor: number;
  className?: string;
}) {
  const c = config[tipo];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        c.chip,
        className
      )}
    >
      <span className="tabular-nums">
        {Math.round(valor)}
        {c.unidad}
      </span>
      <span className="opacity-70">{c.label}</span>
    </span>
  );
}

export function MacroChipsRow({
  calorias,
  proteinas,
  carbos,
  grasas,
}: {
  calorias: number;
  proteinas: number;
  carbos: number;
  grasas: number;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <MacroChip tipo="kcal" valor={calorias} />
      <MacroChip tipo="protein" valor={proteinas} />
      <MacroChip tipo="carbs" valor={carbos} />
      <MacroChip tipo="fat" valor={grasas} />
    </div>
  );
}
