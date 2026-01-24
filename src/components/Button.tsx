import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ComponentProps, ReactNode } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type MotionButtonProps = ComponentProps<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, 'children'> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25",
        secondary: "bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/25",
        outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100",
        ghost: "bg-transparent hover:bg-slate-800 text-slate-100",
        glow: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/50 hover:shadow-cyan-500/50 hover:scale-[1.02] transition-all duration-300"
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-lg"
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : null}
            {children}
        </motion.button>
    );
};
