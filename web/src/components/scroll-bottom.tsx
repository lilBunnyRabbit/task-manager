import React from "react";

interface ScrollBottomProps {
  className?: string;
  children?: React.ReactNode;
}

export const ScrollBottom: React.FC<ScrollBottomProps> = ({ className, children }) => {
  const [stopAuto, setStopAuto] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    const scrollElement = scrollRef.current;
    if (!element || !scrollElement || stopAuto) return;

    const resizeObserver = new ResizeObserver(() => {
      scrollElement.scrollTo(0, scrollElement.scrollHeight);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [stopAuto]);

  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    function onWheel(this: HTMLDivElement) {
      if (Math.abs(this.scrollHeight - this.scrollTop - this.clientHeight) < 200) {
        setStopAuto(false);
      } else {
        setStopAuto(true);
      }
    }

    element.addEventListener("wheel", onWheel);

    return () => {
      element.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div ref={scrollRef} className={className}>
      <div ref={ref}>{children}</div>
    </div>
  );
};
