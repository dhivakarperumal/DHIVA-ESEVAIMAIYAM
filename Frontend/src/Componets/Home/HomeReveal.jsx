import { m, useReducedMotion } from "framer-motion";

const revealVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const HomeReveal = ({ children, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.05 }}
      variants={revealVariants}
    >
      {children}
    </m.div>
  );
};

export default HomeReveal;
