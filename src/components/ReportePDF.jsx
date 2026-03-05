import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer'

const MONTHS = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtDate(iso) {
  if (!iso) return ''
  const parts = iso.split('-')
  return `${parseInt(parts[2])} ${MONTHS[parseInt(parts[1])]} ${parts[0]}`
}

const EVAL_LABELS = {
  en_desarrollo: 'En desarrollo',
  progresando:   'Progresando',
  logrado:       'Logrado',
}

const EVAL_COLORS = {
  en_desarrollo: '#F4A261',
  progresando:   '#E9C46A',
  logrado:       '#2A9D8F',
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    color: '#333',
  },

  // Header
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#7B2D8E',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {},
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#7B2D8E',
  },
  headerSub: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#7B2D8E',
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F9F5FF',
    borderRadius: 10,
    padding: 10,
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
  },
  infoSub: {
    fontSize: 9,
    color: '#666',
    marginTop: 1,
  },

  // Attendance bar
  attRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  attBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#EEE',
    borderRadius: 4,
  },
  attBarFill: {
    height: 8,
    borderRadius: 4,
  },
  attText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: 36,
    textAlign: 'right',
  },

  // Section
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7B2D8E',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#7B2D8E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 10,
    color: '#444',
    lineHeight: 1.6,
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 10,
  },

  // Competencies grid
  compGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  compPill: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  compText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  compSub: {
    fontSize: 7,
    opacity: 0.75,
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#BDBDBD',
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#CE93D8',
  },
})

// ── Documento PDF ─────────────────────────────────────────────────
export function ReportePDFDoc({ reporte, evaluaciones }) {
  const attPct = reporte.total_clases
    ? Math.round((reporte.asistencias_count / reporte.total_clases) * 100)
    : 0
  const attColor = attPct >= 80 ? '#2A9D8F' : attPct >= 60 ? '#D97706' : '#E76F51'
  const attBg    = attPct >= 80 ? '#E6F7F5' : attPct >= 60 ? '#FEF3C7' : '#FEF0EC'

  const evalEntries = Object.entries(evaluaciones || {}).filter(([, v]) => v?.estado)

  return (
    <Document title={`Reporte Ciclo ${reporte.numero_ciclo} — ${reporte.student_name}`}>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Studio Dancers</Text>
            <Text style={styles.headerSub}>Reporte de Progreso — Ciclo {reporte.numero_ciclo}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>APROBADO</Text>
          </View>
        </View>

        {/* ── Info boxes ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Alumna</Text>
            <Text style={styles.infoValue}>{reporte.student_name}</Text>
            <Text style={styles.infoSub}>{reporte.course_name}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Ciclo {reporte.numero_ciclo}</Text>
            <Text style={styles.infoValue}>
              {fmtDate(reporte.fecha_inicio)}{reporte.fecha_fin ? ` – ${fmtDate(reporte.fecha_fin)}` : ''}
            </Text>
            {reporte.instructor_name ? (
              <Text style={styles.infoSub}>Instructora: {reporte.instructor_name}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Asistencia ── */}
        <View style={styles.attRow}>
          <Text style={{ fontSize: 9, color: '#666', width: 60 }}>Asistencia</Text>
          <View style={styles.attBarBg}>
            <View style={[styles.attBarFill, { width: `${attPct}%`, backgroundColor: attColor }]} />
          </View>
          <Text style={[styles.attText, { color: attColor }]}>{attPct}%</Text>
          <Text style={{ fontSize: 9, color: '#999' }}>
            ({reporte.asistencias_count}/{reporte.total_clases})
          </Text>
        </View>

        {/* ── Resumen del contenido ── */}
        {reporte.resumen_contenido ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Contenido trabajado</Text>
            </View>
            <Text style={styles.bodyText}>{reporte.resumen_contenido}</Text>
          </View>
        ) : null}

        {/* ── Evaluaciones de competencias ── */}
        {evalEntries.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#F4A261' }]} />
              <Text style={[styles.sectionTitle, { color: '#F4A261' }]}>Evaluación de competencias</Text>
            </View>
            <View style={styles.compGrid}>
              {evalEntries.map(([comp, ev]) => {
                const color = EVAL_COLORS[ev.estado] || '#9E9E9E'
                return (
                  <View key={comp} style={[styles.compPill, { backgroundColor: color + '22' }]}>
                    <View style={[styles.compDot, { backgroundColor: color }]} />
                    <View>
                      <Text style={[styles.compText, { color }]}>{comp}</Text>
                      <Text style={[styles.compSub, { color }]}>{EVAL_LABELS[ev.estado] || ev.estado}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        {/* ── Observación de la instructora ── */}
        {reporte.observacion_profesora ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#2A9D8F' }]} />
              <Text style={[styles.sectionTitle, { color: '#2A9D8F' }]}>Observación de la instructora</Text>
            </View>
            <Text style={styles.bodyText}>{reporte.observacion_profesora}</Text>
          </View>
        ) : null}

        {/* ── Próximo ciclo ── */}
        {reporte.proximo_ciclo_texto ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#AB47BC' }]} />
              <Text style={[styles.sectionTitle, { color: '#AB47BC' }]}>Próximo ciclo</Text>
            </View>
            <Text style={[styles.bodyText, { fontFamily: 'Helvetica-Oblique' }]}>
              {reporte.proximo_ciclo_texto}
            </Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Aprobado {reporte.fecha_aprobado ? fmtDate(reporte.fecha_aprobado.slice(0, 10)) : ''}
          </Text>
          <Text style={styles.footerBrand}>Studio Dancers · MI Studio</Text>
        </View>

      </Page>
    </Document>
  )
}

// ── Helper: generar y descargar el PDF ───────────────────────────
export async function generateReportePDF(reporte, evaluaciones) {
  const blob = await pdf(
    <ReportePDFDoc reporte={reporte} evaluaciones={evaluaciones} />
  ).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Reporte_${reporte.student_name.replace(/\s+/g, '_')}_Ciclo${reporte.numero_ciclo}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
