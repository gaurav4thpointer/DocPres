"use client";

export function PrintControls() {
  return (
    <div
      className="no-print"
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 50,
        display: "flex",
        gap: "8px",
      }}
    >
      <button
        onClick={() => window.print()}
        style={{
          background: "#0284c7",
          color: "white",
          border: "none",
          padding: "8px 20px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "system-ui",
        }}
      >
        🖨 Print / Save PDF
      </button>
      <button
        onClick={() => window.close()}
        style={{
          background: "#f3f4f6",
          color: "#374151",
          border: "1px solid #e5e7eb",
          padding: "8px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "system-ui",
        }}
      >
        Close
      </button>
    </div>
  );
}

