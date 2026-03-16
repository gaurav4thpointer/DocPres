import { getPrescription } from "@/lib/actions/prescriptions";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { MEDICINE_TIMINGS } from "@/lib/utils";
import { parseEyeTemplateData, hasEyeData } from "@/lib/prescription-templates/eye";

export default async function PrescriptionPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prescription = await getPrescription(id);
  if (!prescription) notFound();

  const { doctor, patient, items } = prescription;
  const clinic = doctor.clinicSettings;
  const isEye = prescription.prescriptionType === "EYE";
  const eyeData = parseEyeTemplateData(prescription.templateData);
  const showEyeSection = isEye && hasEyeData(eyeData);

  const timingLabel = (t: string | null | undefined) =>
    MEDICINE_TIMINGS.find((x) => x.value === t)?.label ?? t ?? "";

  const patientAge = patient.age
    ? `${patient.age} yrs`
    : patient.dateOfBirth
    ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs`
    : "";

  const eyeRows: { label: string; right: string | undefined; left: string | undefined }[] = [
    { label: "Vision",    right: eyeData.visionRight,      left: eyeData.visionLeft },
    { label: "Sphere",    right: eyeData.rightEyeSphere,   left: eyeData.leftEyeSphere },
    { label: "Cylinder",  right: eyeData.rightEyeCylinder, left: eyeData.leftEyeCylinder },
    { label: "Axis",      right: eyeData.rightEyeAxis,     left: eyeData.leftEyeAxis },
    { label: "Add",       right: eyeData.rightEyeAdd,      left: eyeData.leftEyeAdd },
    { label: "Prism",     right: eyeData.rightEyePrism,    left: eyeData.leftEyePrism },
  ];

  const eyeRowsToShow = eyeRows.filter((r) => r.right || r.left);

  return (
    <div>
      {/* Print button — hidden on print */}
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

      {/* A4 Prescription */}
      <div
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "0 auto",
          padding: "12mm 14mm",
          background: "white",
          fontSize: "10.5pt",
          lineHeight: "1.5",
          fontFamily: "'Times New Roman', Times, serif",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            paddingBottom: "10px",
            borderBottom: "2px solid #0ea5e9",
            marginBottom: "10px",
          }}
        >
          {/* Logo */}
          <div style={{ width: "60px" }}>
            {clinic?.logoPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clinic.logoPath}
                alt="Clinic Logo"
                style={{ width: "56px", height: "56px", objectFit: "contain" }}
              />
            ) : (
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "#e0f2fe",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                🏥
              </div>
            )}
          </div>

          {/* Clinic Info — Center */}
          <div style={{ flex: 1, textAlign: "center", padding: "0 16px" }}>
            <div style={{ fontSize: "16pt", fontWeight: "bold", color: "#0c4a6e" }}>
              {clinic?.clinicName ?? "Medical Clinic"}
            </div>
            {clinic?.address && (
              <div style={{ fontSize: "9pt", color: "#475569", marginTop: "2px" }}>
                {clinic.address}
              </div>
            )}
            {clinic?.phone && (
              <div style={{ fontSize: "9pt", color: "#475569" }}>Tel: {clinic.phone}</div>
            )}
          </div>

          {/* Doctor Info — Right */}
          <div style={{ textAlign: "right", minWidth: "160px" }}>
            <div style={{ fontSize: "12pt", fontWeight: "bold", color: "#0c4a6e" }}>
              Dr. {doctor.name}
            </div>
            {doctor.qualification && (
              <div style={{ fontSize: "9pt", color: "#475569" }}>{doctor.qualification}</div>
            )}
            {doctor.specialization && (
              <div style={{ fontSize: "9pt", color: "#0ea5e9", fontStyle: "italic" }}>
                {doctor.specialization}
              </div>
            )}
            {doctor.registrationNo && (
              <div style={{ fontSize: "8pt", color: "#64748b" }}>
                Reg. No: {doctor.registrationNo}
              </div>
            )}
            {doctor.mobile && (
              <div style={{ fontSize: "8pt", color: "#64748b" }}>Mob: {doctor.mobile}</div>
            )}
          </div>
        </div>

        {/* PATIENT BAR */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "6px",
            padding: "8px 12px",
            marginBottom: "12px",
            fontSize: "10pt",
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>Patient: </span>
            <strong>{patient.fullName}</strong>
          </div>
          {(patientAge || patient.gender) && (
            <div>
              <span style={{ color: "#64748b" }}>Age/Sex: </span>
              <strong>
                {patientAge}
                {patientAge && patient.gender ? " / " : ""}
                {patient.gender}
              </strong>
            </div>
          )}
          {patient.mobile && (
            <div>
              <span style={{ color: "#64748b" }}>Mob: </span>
              <strong>{patient.mobile}</strong>
            </div>
          )}
          <div style={{ marginLeft: "auto" }}>
            <span style={{ color: "#64748b" }}>Date: </span>
            <strong>{format(new Date(prescription.prescriptionDate), "dd MMM yyyy")}</strong>
          </div>
          {prescription.followUpDate && (
            <div>
              <span style={{ color: "#64748b" }}>Follow-up: </span>
              <strong>{format(new Date(prescription.followUpDate), "dd MMM yyyy")}</strong>
            </div>
          )}
        </div>

        {/* CLINICAL SECTION */}
        {(prescription.chiefComplaints || prescription.diagnosis) && (
          <div style={{ marginBottom: "10px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {prescription.chiefComplaints && (
                  <tr>
                    <td style={{ width: "130px", fontWeight: "bold", color: "#374151", verticalAlign: "top", paddingBottom: "4px", fontSize: "9.5pt" }}>
                      C/O (Complaints):
                    </td>
                    <td style={{ paddingBottom: "4px", fontSize: "9.5pt" }}>
                      {prescription.chiefComplaints}
                    </td>
                  </tr>
                )}
                {prescription.diagnosis && (
                  <tr>
                    <td style={{ width: "130px", fontWeight: "bold", color: "#374151", verticalAlign: "top", fontSize: "9.5pt" }}>
                      Diagnosis:
                    </td>
                    <td style={{ fontStyle: "italic", fontSize: "9.5pt" }}>
                      {prescription.diagnosis}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* EYE PRESCRIPTION SECTION */}
        {showEyeSection && (
          <div style={{ marginBottom: "14px" }}>
            {/* Section heading */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "10pt", fontWeight: "bold", color: "#0c4a6e" }}>
                Eye Prescription
              </span>
              <div style={{ flex: 1, height: "1px", background: "#bae6fd" }} />
            </div>

            {/* Refraction table */}
            {eyeRowsToShow.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "8px",
                  fontSize: "9.5pt",
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f9ff" }}>
                    <th
                      style={{
                        border: "1px solid #bae6fd",
                        padding: "5px 8px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "#0c4a6e",
                        width: "30%",
                      }}
                    >
                      Parameter
                    </th>
                    <th
                      style={{
                        border: "1px solid #bae6fd",
                        padding: "5px 8px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#0c4a6e",
                        width: "35%",
                      }}
                    >
                      Right Eye (RE)
                    </th>
                    <th
                      style={{
                        border: "1px solid #bae6fd",
                        padding: "5px 8px",
                        textAlign: "center",
                        fontWeight: "600",
                        color: "#0c4a6e",
                        width: "35%",
                      }}
                    >
                      Left Eye (LE)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eyeRowsToShow.map((row, i) => (
                    <tr
                      key={row.label}
                      style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}
                    >
                      <td
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "5px 8px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "5px 8px",
                          textAlign: "center",
                        }}
                      >
                        {row.right ?? "—"}
                      </td>
                      <td
                        style={{
                          border: "1px solid #e2e8f0",
                          padding: "5px 8px",
                          textAlign: "center",
                        }}
                      >
                        {row.left ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Additional eye details */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5pt" }}>
              <tbody>
                {eyeData.pd && (
                  <tr>
                    <td style={{ width: "160px", fontWeight: "bold", color: "#374151", paddingBottom: "3px" }}>PD:</td>
                    <td style={{ paddingBottom: "3px" }}>{eyeData.pd}</td>
                  </tr>
                )}
                {eyeData.diagnosisDetails && (
                  <tr>
                    <td style={{ fontWeight: "bold", color: "#374151", paddingBottom: "3px" }}>Diagnosis:</td>
                    <td style={{ fontStyle: "italic", paddingBottom: "3px" }}>{eyeData.diagnosisDetails}</td>
                  </tr>
                )}
                {eyeData.lensAdvice && (
                  <tr>
                    <td style={{ fontWeight: "bold", color: "#374151", paddingBottom: "3px" }}>Lens Advice:</td>
                    <td style={{ paddingBottom: "3px" }}>{eyeData.lensAdvice}</td>
                  </tr>
                )}
                {eyeData.frameAdvice && (
                  <tr>
                    <td style={{ fontWeight: "bold", color: "#374151", paddingBottom: "3px" }}>Frame Advice:</td>
                    <td style={{ paddingBottom: "3px" }}>{eyeData.frameAdvice}</td>
                  </tr>
                )}
                {eyeData.remarks && (
                  <tr>
                    <td style={{ fontWeight: "bold", color: "#374151", verticalAlign: "top", paddingBottom: "3px" }}>Remarks:</td>
                    <td style={{ paddingBottom: "3px", whiteSpace: "pre-wrap" }}>{eyeData.remarks}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* RX SECTION */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "22pt",
                fontFamily: "serif",
                fontStyle: "italic",
                fontWeight: "bold",
                color: "#0c4a6e",
                lineHeight: "1",
              }}
            >
              ℞
            </span>
            <div style={{ flex: 1, height: "1px", background: "#cbd5e1" }} />
          </div>

          {items.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No medicines prescribed</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>#</th>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>Medicine</th>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>Dosage</th>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>Frequency</th>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>Duration</th>
                  <th style={{ textAlign: "left", fontSize: "8.5pt", color: "#64748b", padding: "3px 4px", fontWeight: "600" }}>Timing</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    style={{
                      background: i % 2 === 0 ? "white" : "#f8fafc",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td style={{ padding: "5px 4px", fontSize: "9.5pt", color: "#94a3b8", width: "20px" }}>
                      {i + 1}.
                    </td>
                    <td style={{ padding: "5px 4px", fontSize: "10pt", fontWeight: "600" }}>
                      {item.medicineName}
                      {item.strength && (
                        <span style={{ fontWeight: "normal", color: "#475569" }}> {item.strength}</span>
                      )}
                      {item.instructions && (
                        <div style={{ fontSize: "8.5pt", color: "#64748b", fontStyle: "italic", fontWeight: "normal" }}>
                          {item.instructions}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "5px 4px", fontSize: "9.5pt" }}>{item.dosage ?? "—"}</td>
                    <td style={{ padding: "5px 4px", fontSize: "9.5pt" }}>{item.frequency ?? "—"}</td>
                    <td style={{ padding: "5px 4px", fontSize: "9.5pt" }}>{item.duration ?? "—"}</td>
                    <td style={{ padding: "5px 4px", fontSize: "9.5pt" }}>{timingLabel(item.timing)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* INVESTIGATIONS */}
        {prescription.investigations && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold", fontSize: "9.5pt", color: "#374151", marginBottom: "3px" }}>
              Investigations Advised:
            </div>
            <div style={{ fontSize: "9.5pt", paddingLeft: "8px" }}>
              {prescription.investigations}
            </div>
          </div>
        )}

        {/* ADVICE */}
        {prescription.generalAdvice && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold", fontSize: "9.5pt", color: "#374151", marginBottom: "3px" }}>
              General Advice:
            </div>
            <div style={{ fontSize: "9.5pt", paddingLeft: "8px", whiteSpace: "pre-wrap" }}>
              {prescription.generalAdvice}
            </div>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: "40px" }} />

        {/* FOOTER / SIGNATURE */}
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            marginTop: "20px",
            paddingTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div>
            {clinic?.footerText && (
              <p style={{ fontSize: "8pt", color: "#64748b", maxWidth: "400px" }}>
                {clinic.footerText}
              </p>
            )}
          </div>

          <div style={{ textAlign: "center", minWidth: "160px" }}>
            {clinic?.signaturePath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clinic.signaturePath}
                alt="Signature"
                style={{ height: "48px", objectFit: "contain", marginBottom: "4px" }}
              />
            )}
            {clinic?.stampPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clinic.stampPath}
                alt="Stamp"
                style={{ height: "48px", objectFit: "contain", marginBottom: "4px", marginLeft: "8px" }}
              />
            )}
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "4px" }}>
              <div style={{ fontSize: "9.5pt", fontWeight: "bold" }}>Dr. {doctor.name}</div>
              {doctor.qualification && (
                <div style={{ fontSize: "8.5pt", color: "#475569" }}>{doctor.qualification}</div>
              )}
              {doctor.specialization && (
                <div style={{ fontSize: "8.5pt", color: "#475569" }}>{doctor.specialization}</div>
              )}
            </div>
          </div>
        </div>

        {/* Page number / watermark */}
        <div
          style={{
            textAlign: "center",
            marginTop: "8px",
            fontSize: "7pt",
            color: "#cbd5e1",
          }}
        >
          DocPres · Digital Prescription
        </div>
      </div>

      {/* Print trigger script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('keydown', function(e) {
              if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                // let browser handle default print
              }
            });
          `,
        }}
      />
    </div>
  );
}
