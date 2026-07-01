interface WaveDividerProps {
  fill: string;
  height?: number;
  variant?: 'forest' | 'sand' | 'cream' | 'transparent-dark' | 'transparent-light';
}

export default function WaveDivider({ fill, height = 120, variant = 'forest' }: WaveDividerProps) {
  const paths: Record<string, string> = {
    'forest': 'M0,80 C240,120 480,20 720,60 C960,100 1200,30 1440,70 L1440,120 L0,120 Z',
    'sand': 'M0,60 C180,110 360,20 540,70 C720,110 900,30 1080,80 C1200,50 1340,100 1440,40 L1440,120 L0,120 Z',
    'cream': 'M0,50 C200,100 400,15 600,65 C800,105 1000,25 1200,75 C1320,55 1400,90 1440,45 L1440,120 L0,120 Z',
    'transparent-dark': 'M0,40 C240,110 480,10 720,80 C960,110 1200,20 1440,60 L1440,120 L0,120 Z',
    'transparent-light': 'M0,50 C200,100 400,15 600,60 C800,100 1000,20 1200,70 C1320,50 1400,90 1440,40 L1440,120 L0,120 Z',
  };

  return (
    <div className="relative" style={{ marginTop: '-1px', zIndex: 2 }} aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: `${height}px` }}
      >
        <path d={paths[variant]} fill={fill} />
      </svg>
    </div>
  );
}
