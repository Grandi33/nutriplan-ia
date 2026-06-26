'use client';

import { MacroBar } from './MacroBar';
import { Card } from '@/components/ui/Card';
import type { DiaPlan, ResumenPlan } from '@/lib/types';

export function DayMacros({
  dia,
  resumen,
}: {
  dia: DiaPlan;
  resumen: ResumenPlan;
}) {
  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Macros del día
      </h3>
      <MacroBar
        label="Calorías"
        valor={dia.total_calorias}
        objetivo={resumen.calorias_diarias}
        unidad=" kcal"
        barClassName="bg-kcal"
      />
      <MacroBar
        label="Proteínas"
        valor={dia.total_proteinas}
        objetivo={resumen.proteinas_g}
        barClassName="bg-protein"
      />
      <MacroBar
        label="Carbohidratos"
        valor={dia.total_carbos}
        objetivo={resumen.carbohidratos_g}
        barClassName="bg-carbs"
      />
      <MacroBar
        label="Grasas"
        valor={dia.total_grasas}
        objetivo={resumen.grasas_g}
        barClassName="bg-fat"
      />
    </Card>
  );
}
