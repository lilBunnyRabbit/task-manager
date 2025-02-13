import Markdown from "react-markdown";
import changelog from "../../../CHANGELOG.md?raw";
import "../styles/md.styles.css";

export default function ChangelogRoute() {
  return (
    <div className="px-8">
      <div className="container mx-auto py-16">
        <h2 className="text-3xl font-bold mb-4">Changelog</h2>
        <p className="mb-16">
          Stay updated with the latest changes, new features, and bug fixes. Explore
          version histories to see what's new, improved, or fixed, and ensure you're making the most of the library's
          capabilities by staying on the latest version.
        </p>

        <div className="md-render [&_h1]:hidden">
          <Markdown>{changelog}</Markdown>
        </div>
      </div>
    </div>
  );
}
