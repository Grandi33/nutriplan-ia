'use client';

import type { PlanSemanal, Comida } from '@/lib/types';
import { ORDEN_COMIDAS, LABEL_COMIDA, CATEGORIAS_COMPRA } from '@/lib/constants';
import { formatFecha } from '@/lib/utils';

// Componente oculto, optimizado para captura con html2canvas → PDF.
// Usa colores fijos (no variables CSS) para verse bien en cualquier tema.

const C = {
  bg: '#F7F3EE',
  surface: '#FFFFFF',
  primary: '#1D3D28',
  accent: '#E05C38',
  gold: '#C9943A',
  text: '#1F2420',
  muted: '#717171',
  line: '#E3DDD3',
};

function MacroLine({ comida }: { comida: Comida }) {
  return (
    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
      {Math.round(comida.calorias)} kcal · P {Math.round(comida.proteinas)}g · C{' '}
      {Math.round(comida.carbos)}g · G {Math.round(comida.grasas)}g
    </div>
  );
}

export function PlanPDFContent({ plan }: { plan: PlanSemanal }) {
  return (
    <div
      id="plan-pdf"
      style={{
        position: 'absolute',
        left: -99999,
        top: 0,
        width: 800,
        background: C.bg,
        color: C.text,
        fontFamily: 'Georgia, serif',
        padding: 40,
      }}
    >
      {/* Portada */}
      <div
        style={{
          background: C.primary,
          color: '#fff',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.8 }}>🥗 NutriPlan IA</div>
        <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8 }}>
          Plan de {plan.nombrePersona ?? 'la semana'}
        </div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 6 }}>
          {formatFecha(plan.fechaCreacion)} · {plan.resumen.objetivo}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 14, lineHeight: 1.5 }}>
          {plan.resumen.descripcionPlan}
        </div>
      </div>

      {/* Resumen nutricional */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginBottom: 12 }}>
          Resumen nutricional diario
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            ['Calorías', `${plan.resumen.calorias_diarias} kcal`],
            ['Proteínas', `${plan.resumen.proteinas_g} g`],
            ['Carbohidratos', `${plan.resumen.carbohidratos_g} g`],
            ['Grasas', `${plan.resumen.grasas_g} g`],
            ['Fibra', `${plan.resumen.fibra_g} g`],
            ['Agua', `${plan.resumen.agua_litros} L`],
          ].map(([l, v]) => (
            <div key={l} style={{ minWidth: 110 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{v}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Días */}
      {plan.dias.map((dia) => (
        <div
          key={dia.nombre}
          style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: `1px solid ${C.line}`,
              paddingBottom: 8,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>
              {dia.nombre}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              {dia.total_calorias} kcal · P {dia.total_proteinas}g · C{' '}
              {dia.total_carbos}g · G {dia.total_grasas}g
            </div>
          </div>

          {ORDEN_COMIDAS.map((tipo) => {
            const comida = dia.comidas[tipo];
            if (!comida) return null;
            return (
              <div key={tipo} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.accent, fontWeight: 700 }}>
                  {LABEL_COMIDA[tipo].toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {comida.emoji} {comida.nombre}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {comida.descripcion_breve}
                </div>
                <MacroLine comida={comida} />
              </div>
            );
          })}

          {dia.nota_dia && (
            <div
              style={{
                fontSize: 12,
                color: C.muted,
                fontStyle: 'italic',
                marginTop: 8,
              }}
            >
              💬 {dia.nota_dia}
            </div>
          )}
        </div>
      ))}

      {/* Lista de la compra */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.line}`,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 12 }}>
          🛒 Lista de la compra
        </div>
        {CATEGORIAS_COMPRA.map((cat) => {
          const items = plan.lista_compra[cat.key];
          if (!items || items.length === 0) return null;
          return (
            <div key={cat.key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {cat.emoji} {cat.label}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {items.join(' · ')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consejos */}
      {plan.consejos && plan.consejos.length > 0 && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 12 }}>
            ✨ Consejos
          </div>
          {plan.consejos.map((c, i) => (
            <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
              • {c}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 20 }}>
        Generado con NutriPlan IA · {formatFecha(plan.fechaCreacion)}
      </div>
    </div>
  );
}
