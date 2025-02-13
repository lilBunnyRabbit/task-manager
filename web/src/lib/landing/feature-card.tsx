import { CodeBlock } from "@/components/code-block";
import { GithubIcon, NpmIcon } from "@/components/icons";
import { type LucideIcon } from "lucide-react";
import { cn } from "../utils";

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

interface FeaturedPackageCardProps {
  npm: string;
  github: string;
  description: React.ReactNode;
  className?: string;
}

export const FeaturedPackageCard: React.FC<FeaturedPackageCardProps> = ({ npm, github, description, className }) => {
  const npmLink = `https://www.npmjs.com/package/${npm}`;

  return (
    <div
      className={cn(
        "p-6 bg-foreground/10 rounded-lg border border-foreground hover:bg-foreground/20 transition-colors",
        className
      )}
    >
      <div className="grid grid-cols-[1fr,min-content,min-content] gap-x-4">
        <a className="cursor-pointer mb-2" href={npmLink}>
          <h3 className="text-xl font-semibold">{npm}</h3>
        </a>

        <a href={npmLink} className="[&_svg]:size-5">
          <NpmIcon />
        </a>

        <a href={`https://github.com/${github}`} className="[&_svg]:size-5">
          <GithubIcon className="text-current" />
        </a>
      </div>

      <div className="space-x-2 mb-2">
        <a href={npmLink} rel="nofollow" className="inline-block">
          <img alt="NPM Version" src={`https://img.shields.io/npm/v/${npm}`} />
        </a>
        <a href={npmLink} rel="nofollow" className="inline-block">
          <img alt="NPM Downloads" src={`https://img.shields.io/npm/d18m/${npm}`} />
        </a>
      </div>

      <p className="text-foreground/80">{description}</p>
    </div>
  );
};
