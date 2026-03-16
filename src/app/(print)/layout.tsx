export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', Times, serif; background: white; color: #111; }
          @media print {
            .no-print { display: none !important; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            @page { size: A4; margin: 10mm; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
