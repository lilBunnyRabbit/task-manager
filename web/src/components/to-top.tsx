import React from "react";
import { Button } from "./ui/button";
import { ArrowUpToLineIcon } from "lucide-react";

export const ToTop: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    isScrolled && (
      <Button
        size="icon"
        className="fixed right-7 bottom-6 opacity-60 hover:opacity-100 hover:bg-foreground hover:text-background active:translate-y-px"
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }}
      >
        <ArrowUpToLineIcon />
      </Button>
    )
  );
};
