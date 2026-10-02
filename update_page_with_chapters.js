const fs = require('fs');
const path = 'apps/web/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add 'Play' to lucide-react imports if not present
if (!content.includes('Play')) {
    content = content.replace(/Users,/g, 'Users,\n  Play,');
}

// 2. Add CHAPTERS array outside the component
const chaptersCode = `
const VIDEO_CHAPTERS = [
  { label: 'Introduction', start: 0 },
  { label: 'Trainee Portal', start: 49 },
  { label: 'Trainer Studio', start: 78 },
  { label: 'Admin Dashboard', start: 105 },
  { label: 'Verification', start: 124 },
  { label: 'Outro', start: 134 }
];
`;
content = content.replace('export default function LandingPage() {', chaptersCode + '\nexport default function LandingPage() {');

// 3. Add activeChapter state inside the component
const stateCode = `  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(null);

  const videoUrl = activeChapter !== null
    ? \`https://www.youtube.com/embed/1YdGX3fXZtk?start=\${activeChapter}&autoplay=1&rel=0\`
    : \`https://www.youtube.com/embed/1YdGX3fXZtk?rel=0\`;
`;
content = content.replace('  const [isAuthOpen, setIsAuthOpen] = useState(false);', stateCode);

// 4. Modify the Hero Section
const heroRegex = /<section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">([\s\S]*?)\{\/\* Feature Highlights Grid/;

const replacement = `<section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="max-w-3xl">
            $1
          
          <div className="flex flex-col gap-5 w-full">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border bg-black">
              {/* Added lazy loading and conditional rendering to not autoplay immediately on load */}
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
                title="Capacity Connect Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <div className="surface-card p-5 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Jump to Chapter
              </span>
              <div className="flex flex-wrap gap-2.5">
                {VIDEO_CHAPTERS.map((chapter) => (
                  <button
                    key={chapter.label}
                    onClick={() => setActiveChapter(chapter.start)}
                    className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border \${
                      activeChapter === chapter.start
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                        : 'bg-accent/50 hover:bg-accent text-foreground border-border hover:scale-105'
                    }\`}
                  >
                    <Play className="w-3 h-3" /> {chapter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid`;

// Need to match exactly what is in $1. In the original, $1 contains from `<div className="max-w-3xl">` up to `</div>\n        </div>\n\n        `.
// We need to carefully strip the closing `</div>\n        </div>` from $1 so we don't duplicate closures.
content = content.replace(heroRegex, (match, p1) => {
    // p1 has `<div className="max-w-3xl"> ... </div> \n </div>`
    // We want to replace the LAST TWO `</div>` tags.
    const lastDivIndex = p1.lastIndexOf('</div>');
    const secondLastDivIndex = p1.lastIndexOf('</div>', lastDivIndex - 1);
    
    // Snip off the ending two divs
    const p1Clean = p1.substring(0, secondLastDivIndex);

    return \`<section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          \${p1Clean}
          </div>

          <div className="flex flex-col gap-5 w-full">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-border bg-black">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
                title="Capacity Connect Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <div className="surface-card p-5 rounded-xl border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                Jump to Chapter
              </span>
              <div className="flex flex-wrap gap-2.5">
                {VIDEO_CHAPTERS.map((chapter) => (
                  <button
                    key={chapter.label}
                    onClick={() => setActiveChapter(chapter.start)}
                    className={\\\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border \\\${
                      activeChapter === chapter.start
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                        : 'bg-accent/50 hover:bg-accent text-foreground border-border hover:scale-105'
                    }\\\`}
                  >
                    <Play className="w-3 h-3" /> {chapter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid\`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully added chapter buttons and fixed layout!');
