import { Link } from "react-router-dom";

const PageHeader = ({ title, description, background }) => {
  return (
    <header
      className="relative flex min-h-[220px] w-full items-center justify-center border-b border-primary/30 bg-cover bg-center px-4 py-10 text-white sm:min-h-[260px] lg:min-h-[290px]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.9), rgba(0,0,0,.55)), url("${background || "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png"}")`,
      }}
    >
      <div className="relative mx-auto w-full max-w-[1700px] text-center">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center justify-center gap-2 text-xs text-slate-300 sm:text-sm">
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
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </header>
  );
};

export default PageHeader;