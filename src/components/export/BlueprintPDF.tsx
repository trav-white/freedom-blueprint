'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 300 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZg.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    backgroundColor: '#0a0f1c',
    color: '#e2e8f0',
    padding: 48,
  },
  coverPage: {
    fontFamily: 'Inter',
    backgroundColor: '#0a0f1c',
    color: '#e2e8f0',
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 12,
    fontWeight: 300,
    color: '#635bff',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  coverLine: {
    width: 40,
    height: 2,
    backgroundColor: '#635bff',
    marginBottom: 24,
  },
  coverDate: {
    fontSize: 10,
    fontWeight: 300,
    color: '#64748b',
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#ffffff',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#635bff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  body: {
    fontSize: 11,
    fontWeight: 300,
    color: '#cbd5e1',
    lineHeight: 1.8,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  scoreArea: {
    fontSize: 11,
    fontWeight: 400,
    color: '#e2e8f0',
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: 600,
  },
  storyText: {
    fontSize: 13,
    fontWeight: 300,
    color: '#e2e8f0',
    lineHeight: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 24,
  },
})

interface BlueprintPDFProps {
  completedAnswers: Record<string, string>
}

export function BlueprintPDF({ completedAnswers }: BlueprintPDFProps) {
  let scores: { area: string; score: number }[]
  try {
    scores = completedAnswers.ws02_scores
      ? JSON.parse(completedAnswers.ws02_scores)
      : []
  } catch {
    scores = []
  }

  const story = completedAnswers.ws08_story ?? completedAnswers.ws08 ?? ''
  const today = new Date().toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      {/* Cover page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverLine} />
        <Text style={styles.coverTitle}>Freedom Blueprint</Text>
        <Text style={styles.coverSubtitle}>Personal</Text>
        <Text style={styles.coverDate}>{today}</Text>
      </Page>

      {/* Wheel of Life scores */}
      {scores.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionLabel}>The Mirror</Text>
          <Text style={styles.sectionTitle}>Wheel of Life</Text>
          {scores.map((s) => (
            <View key={s.area} style={styles.scoreRow}>
              <Text style={styles.scoreArea}>{s.area}</Text>
              <Text
                style={[
                  styles.scoreValue,
                  {
                    color:
                      s.score <= 3
                        ? '#ff6b6b'
                        : s.score <= 6
                          ? '#ffd93d'
                          : '#00d4aa',
                  },
                ]}
              >
                {s.score}/10
              </Text>
            </View>
          ))}
        </Page>
      )}

      {/* Worksheet summaries */}
      {['ws01', 'ws02', 'ws03', 'ws04', 'ws05', 'ws06', 'ws07'].map((slug) => {
        const content = completedAnswers[slug]
        if (!content) return null

        const titles: Record<string, { section: string; title: string }> = {
          ws01: { section: 'The Mirror', title: 'The Opening Question' },
          ws02: { section: 'The Mirror', title: 'Wheel of Life' },
          ws03: { section: 'The Mirror', title: 'Define Your 10' },
          ws04: { section: 'Identity', title: 'BE Identity Statement' },
          ws05: { section: 'Identity', title: 'Your Perfect Life' },
          ws06: { section: 'The Release', title: 'What Keeps You Stuck' },
          ws07: { section: 'The Blueprint', title: 'Freedom Blueprint' },
        }

        const info = titles[slug]
        if (!info) return null

        return (
          <Page key={slug} size="A4" style={styles.page}>
            <Text style={styles.sectionLabel}>{info.section}</Text>
            <Text style={styles.sectionTitle}>{info.title}</Text>
            <Text style={styles.body}>{content}</Text>
          </Page>
        )
      })}

      {/* Freedom Story */}
      {story && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionLabel}>The Blueprint</Text>
          <Text style={styles.sectionTitle}>My Freedom Story</Text>
          <View style={styles.divider} />
          <Text style={styles.storyText}>{story}</Text>
          <View style={styles.divider} />
          <Text style={[styles.body, { textAlign: 'center', color: '#64748b', fontSize: 9 }]}>
            Read every morning.
          </Text>
        </Page>
      )}
    </Document>
  )
}
