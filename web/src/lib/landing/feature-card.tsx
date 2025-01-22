import { type LucideIcon } from "lucide-react";
import { cn } from "../utils";
import { CodeBlock } from "@/components/code-block";

interface FeatureCardProps {
  title: string;
  description: React.ReactNode;
  icon: LucideIcon;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, className }) => {
  return (
    <div
      className={cn(
        "p-6 bg-foreground/10 rounded-lg border border-foreground hover:bg-foreground/20 [&:hover>div:first-of-type]:bg-foreground/20 transition-colors",
        className
      )}
    >
      <div className="size-12 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center mb-4 transition-colors">
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};

export const FeatureHorizontal: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, className }) => {
  return (
    <div className={cn("grid grid-cols-[min-content,1fr] gap-x-4 gap-y-1", className)}>
      <div className="size-8 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center row-span-2 mt-1">
        <Icon size={20} />
      </div>

      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </div>
  );
};

export const UseCaseCard: React.FC<FeatureCardProps & { code?: string }> = ({
  title,
  description,
  icon: Icon,
  code,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 bg-foreground/10 rounded-lg border border-current [&:hover>div:first-of-type]:bg-primary/10 [&:hover>div:first-of-type]:text-primary transition-colors relative overflow-hidden",
        className
      )}
    >
      <div className="size-12 rounded-lg bg-foreground/10 text-foreground flex items-center justify-center mb-4 transition-colors">
        <Icon size={24} />
      </div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="opacity-80 mb-4 min-h-20">{description}</p>

      <div className="rounded-lg overflow-hidden border border-inherit bg-foreground">
        <CodeBlock value={code} readOnly />
      </div>
    </div>
  );
};
