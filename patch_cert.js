const fs = require('fs');
let c = fs.readFileSync('apps/web/app/trainee/certificates/page.tsx', 'utf8');

if (!c.includes('downloadingId')) {
  c = c.replace(
    'const [isLoading, setIsLoading] = useState(true);',
    'const [isLoading, setIsLoading] = useState(true);\n  const [downloadingId, setDownloadingId] = useState<string | null>(null);'
  );

  c = c.replace(
    'const element = document.getElementById(`certificate-${certId}`);',
    'setDownloadingId(certId);\n    const element = document.getElementById(`certificate-${certId}`);'
  );

  c = c.replace(
    '} catch (error) {',
    '} catch (error) {\n      alert("Failed to download certificate. Check console for details.");\n'
  );

  c = c.replace(
    "console.error('Error generating PDF', error);\n    };",
    "console.error('Error generating PDF', error);\n    } finally {\n      setDownloadingId(null);\n    }\n  };"
  );

  c = c.replace(
    '<Download className="w-4 h-4" />',
    '{downloadingId === cert.id ? <Spinner className="w-4 h-4 text-white" /> : <Download className="w-4 h-4" />}'
  );

  c = c.replace(
    '<span> {t("download_pdf")} </span>',
    '<span>{downloadingId === cert.id ? "Generating..." : t("download_pdf")}</span>'
  );

  c = c.replace(
    'className="px-3 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors \nflex items-center gap-2"',
    'disabled={downloadingId === cert.id}\n                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${downloadingId === cert.id ? "bg-emerald-500/50 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}'
  );

  // Fallback if the newline was not matched
  c = c.replace(
    'className="px-3 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center gap-2"',
    'disabled={downloadingId === cert.id}\n                      className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${downloadingId === cert.id ? "bg-emerald-500/50 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}'
  );
  
  fs.writeFileSync('apps/web/app/trainee/certificates/page.tsx', c);
  console.log('Successfully patched Certificates Page with loading state');
}
