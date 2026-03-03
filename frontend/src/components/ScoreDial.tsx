import { motion } from 'framer-motion';

interface ScoreDialProps {
    score: number;
}

export const ScoreDial = ({ score }: ScoreDialProps) => {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    // Color logic based on score
    const getColor = (s: number) => {
        if (s >= 90) return '#4ade80'; // Green 400
        if (s >= 70) return '#facc15'; // Yellow 400
        return '#f87171'; // Red 400
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center w-[200px] h-[200px]">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg] drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
                <circle
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl font-bold text-white tracking-tighter"
                >
                    {score}
                </motion.span>
                <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">ATS Score</span>
            </div>
        </div>
    );
};
