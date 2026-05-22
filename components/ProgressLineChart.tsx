'use client';

import React from 'react';

interface DataPoint {
  date: string;
  sessionNumber: number;
  symptomSeverity: number; // 0-100 (lower is better)
  functionalImprovement: number; // 0-100 (higher is better)
  therapeuticAlliance: number; // 0-100 (higher is better)
}

interface ProgressLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
}

export default function ProgressLineChart({ data, width = 600, height = 350 }: ProgressLineChartProps) {
  if (!data || data.length === 0) return null;

  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scales
  const maxY = 100;
  const minY = 0;
  
  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

  // Generate smooth path for a line
  const generatePath = (values: number[]) => {
    if (values.length < 2) return '';
    
    let path = `M ${getX(0)} ${getY(values[0])}`;
    
    for (let i = 1; i < values.length; i++) {
      const x = getX(i);
      const y = getY(values[i]);
      const prevX = getX(i - 1);
      const prevY = getY(values[i - 1]);
      
      // Cubic bezier for smooth curves
      const cp1x = prevX + (x - prevX) / 3;
      const cp1y = prevY;
      const cp2x = prevX + 2 * (x - prevX) / 3;
      const cp2y = y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }
    
    return path;
  };

  // Generate area under curve
  const generateAreaPath = (values: number[]) => {
    const linePath = generatePath(values);
    if (!linePath) return '';
    
    const lastX = getX(values.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + chartHeight;
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const symptomPath = generatePath(data.map(d => d.symptomSeverity));
  const functionalPath = generatePath(data.map(d => d.functionalImprovement));
  const alliancePath = generatePath(data.map(d => d.therapeuticAlliance));

  // Calculate trend zones (periods of difficulty/improvement)
  const calculateTrendZones = () => {
    const zones: { start: number; end: number; type: 'improving' | 'struggling' | 'stable' }[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];
      
      // Calculate overall change
      const prevTotal = prev.symptomSeverity + (100 - prev.functionalImprovement) + (100 - prev.therapeuticAlliance);
      const currTotal = curr.symptomSeverity + (100 - curr.functionalImprovement) + (100 - curr.therapeuticAlliance);
      const change = prevTotal - currTotal;
      
      let type: 'improving' | 'struggling' | 'stable' = 'stable';
      if (change > 10) type = 'improving';
      else if (change < -10) type = 'struggling';
      
      zones.push({
        start: getX(i - 1),
        end: getX(i),
        type
      });
    }
    
    return zones;
  };

  const trendZones = calculateTrendZones();

  return (
    <div style={{ width: '100%', maxWidth: width, margin: '0 auto' }}>
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap' as const
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '3px', background: '#ef4444', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Symptom Severity</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '3px', background: '#3b82f6', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Functional Improvement</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '3px', background: '#f59e0b', borderRadius: '2px' }} />
          <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>Therapeutic Alliance</span>
        </div>
      </div>

      <svg width={width} height={height} style={{ display: 'block' }}>
        {/* Background trend zones */}
        {trendZones.map((zone, idx) => (
          <rect
            key={idx}
            x={zone.start}
            y={padding.top}
            width={zone.end - zone.start}
            height={chartHeight}
            fill={zone.type === 'improving' ? 'rgba(34, 197, 94, 0.08)' : 
                 zone.type === 'struggling' ? 'rgba(239, 68, 68, 0.08)' : 
                 'rgba(234, 179, 8, 0.05)'}
          />
        ))}

        {/* Grid lines - horizontal */}
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={getY(tick)}
              x2={width - padding.right}
              y2={getY(tick)}
              stroke={tick === 0 ? '#9ca3af' : '#e5e7eb'}
              strokeWidth={tick === 0 ? 2 : 1}
            />
            <text
              x={padding.left - 10}
              y={getY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Grid lines - vertical */}
        {data.map((point, idx) => (
          <g key={idx}>
            <line
              x1={getX(idx)}
              y1={padding.top}
              x2={getX(idx)}
              y2={padding.top + chartHeight}
              stroke="#e5e7eb"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <text
              x={getX(idx)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b5563"
            >
              #{point.sessionNumber}
            </text>
          </g>
        ))}

        {/* Y-axis label */}
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 20, ${height / 2})`}
          fontSize="12"
          fill="#6b7280"
          fontWeight="500"
        >
          Score (0-100)
        </text>

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          fontWeight="500"
        >
          Session Timeline
        </text>

        {/* Area under Symptom Severity curve (with opacity) */}
        <path
          d={generateAreaPath(data.map(d => d.symptomSeverity))}
          fill="rgba(239, 68, 68, 0.1)"
        />

        {/* Symptom Severity line */}
        <path
          d={symptomPath}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Functional Improvement line */}
        <path
          d={functionalPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Therapeutic Alliance line */}
        <path
          d={alliancePath}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Data points - Symptom Severity */}
        {data.map((point, idx) => (
          <circle
            key={`symptom-${idx}`}
            cx={getX(idx)}
            cy={getY(point.symptomSeverity)}
            r={6}
            fill="#ef4444"
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Data points - Functional Improvement */}
        {data.map((point, idx) => (
          <circle
            key={`functional-${idx}`}
            cx={getX(idx)}
            cy={getY(point.functionalImprovement)}
            r={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Data points - Therapeutic Alliance */}
        {data.map((point, idx) => (
          <circle
            key={`alliance-${idx}`}
            cx={getX(idx)}
            cy={getY(point.therapeuticAlliance)}
            r={6}
            fill="#f59e0b"
            stroke="white"
            strokeWidth={2}
          />
        ))}

        {/* Trend indicators */}
        {data.length > 1 && (
          <g>
            {/* Calculate overall trend */}
            {(() => {
              const first = data[0];
              const last = data[data.length - 1];
              const firstTotal = first.symptomSeverity + (100 - first.functionalImprovement) + (100 - first.therapeuticAlliance);
              const lastTotal = last.symptomSeverity + (100 - last.functionalImprovement) + (100 - last.therapeuticAlliance);
              const improvement = firstTotal - lastTotal;
              
              let trendText = '';
              let trendColor = '';
              if (improvement > 15) {
                trendText = '↗ Improving';
                trendColor = '#22c55e';
              } else if (improvement < -15) {
                trendText = '↘ Needs Support';
                trendColor = '#ef4444';
              } else {
                trendText = '→ Stable';
                trendColor = '#eab308';
              }
              
              return (
                <text
                  x={width - padding.right}
                  y={padding.top - 15}
                  textAnchor="end"
                  fontSize="14"
                  fontWeight="700"
                  fill={trendColor}
                >
                  {trendText}
                </text>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Zone legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px', 
        marginTop: '16px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <span>Background zones:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(34, 197, 94, 0.3)', borderRadius: '2px' }} />
          Improving
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.3)', borderRadius: '2px' }} />
          Struggling
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(234, 179, 8, 0.2)', borderRadius: '2px' }} />
          Stable
        </span>
      </div>
    </div>
  );
}
