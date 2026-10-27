import { Link } from "react-router-dom";
import { m, useReducedMotion } from "framer-motion";

const PageHeader = ({ title, description, background, actions = [] }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <m.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[220px] w-full items-center border-b border-primary/30 bg-cover bg-center px-[6%] py-10 text-white sm:min-h-[260px] sm:px-[5%] lg:min-h-[290px] lg:px-[3%]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.92), rgba(0,0,0,.68) 55%, rgba(0,0,0,.3)), url("${background || "/Hero/pageheders.png"}")`,
      }}
    >
      <div className="relative mx-auto w-full max-w-[1700px] text-left">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
          <Link to="/" className="transition hover:text-primary">
            Home
          </Link>
          {title !== "Home" && (
            <>
              <span className="text-primary">/</span>
              <span className="text-white">{title}</span>
            </>
          )}
        </nav>
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            {description}
          </p>
        )}
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map(({ label, to, href, variant = "primary" }) => {
              const className =
                variant === "secondary"
                  ? "inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 bg-black/30 px-5 py-2.5 text-sm font-bold text-white transition hover:border-primary hover:bg-primary/15"
                  : "inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500";

              return href ? (
                <a key={label} href={href} className={className}>
                  {label}
                </a>
              ) : (
                <Link key={label} to={to} className={className}>
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </m.header>
  );
};

export default PageHeader;