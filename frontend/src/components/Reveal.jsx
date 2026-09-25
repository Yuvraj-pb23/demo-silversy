import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => {
    const reduced = useReducedMotion();
    if (reduced) return <div className={className}>{children}</div>;
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const MaskedLine = ({ children, delay }) => {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const show = reduced || inView;
    return (
        <span ref={ref} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <motion.span
                className="block will-change-transform"
                initial={reduced ? false : { y: "115%" }}
                animate={show ? { y: 0 } : { y: "115%" }}
                transition={{ duration: 1.05, delay, ease: [0.25, 1, 0.5, 1] }}
            >
                {children}
            </motion.span>
        </span>
    );
};

export const MaskedLines = ({ lines, className = "", delay = 0, as: Tag = "h2" }) => (
    <Tag className={className}>
        {lines.map((line, i) => (
            <MaskedLine key={i} delay={delay + i * 0.1}>
                {line}
            </MaskedLine>
        ))}
    </Tag>
);

export const ParallaxImage = ({ src, alt, className = "", speed = 42 }) => {
    const ref = useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-speed, speed]);
    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.img
                style={{ y }}
                src={src}
                alt={alt}
                loading="lazy"
                className="h-full w-full object-cover scale-[1.14] will-change-transform"
            />
        </div>
    );
};
