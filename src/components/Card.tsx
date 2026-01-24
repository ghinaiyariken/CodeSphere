import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const Card = ({ children, className = "", hoverEffect = true }: CardProps) => {
    return (
        <motion.div
            initial={hoverEffect ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`glass rounded-xl p-6 shadow-2xl ${className}`}
        >
            {children}
        </motion.div>
    );
};
