import { versions } from "@/config";
import { ArrowRight } from "lucide-react";

export default function ApiReferenceRoute() {
  return (
    <div className="px-8">
      <div className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-4">API References</h2>
        <p className="mb-16">
          Access documentation for different versions of the library. It's recommended to use the latest version for the
          most up-to-date features and improvements.
        </p>

        <div className="space-y-8">
          {versions.map((versionGroup, i) => {
            return (
              <div key={i}>
                <h3 className="text-2xl font-bold mb-4">{versionGroup.root}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {versionGroup.versions.map((version) => (
                    <a
                      key={`${i}-${version.version}`}
                      href={`/docs/api/${version.src}/index.html`}
                      className="p-6 bg-foreground/10 rounded-lg border border-foreground hover:bg-foreground/20 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold text-foreground">Version {version.version}</h2>
                        <ArrowRight />
                      </div>
                      <p className="text-foreground/80 text-sm">Released on {version.date}</p>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
