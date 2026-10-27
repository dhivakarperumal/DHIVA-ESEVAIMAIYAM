import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollNavigator = () => {
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowButtons(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    showButtons && (
      <div className="fixed right-4 bottom-5 z-30 flex flex-col gap-3">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b10] max-[768px]:h-[46px] max-[768px]:w-[46px]"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} strokeWidth={2.5} />
        </button>
      </div>
    )
  );
};

export default ScrollNavigator;