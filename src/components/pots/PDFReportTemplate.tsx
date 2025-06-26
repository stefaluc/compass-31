import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { PDFReportData } from '@/types/pdfReport';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  patientInfo: {
    fontSize: 12,
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  resultBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 10,
    marginBottom: 15,
    border: '1 solid #DDDDDD',
  },
  resultItem: {
    textAlign: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultValuePositive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  resultValueNegative: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  chart: {
    marginBottom: 15,
    alignSelf: 'center',
  },
  measurementsTable: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
    borderBottom: '1 solid #DDDDDD',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    fontSize: 10,
    borderBottom: '0.5 solid #EEEEEE',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellLeft: {
    flex: 1,
    textAlign: 'left',
  },
  interpretation: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    marginBottom: 15,
    border: '1 solid #E5E7EB',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTop: '1 solid #DDDDDD',
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginRight: 10,
  },
  lastColumn: {
    flex: 1,
  },
});

interface PDFReportTemplateProps {
  data: PDFReportData;
}

export const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({ data }) => {
  const {
    patientName,
    testDate,
    initialBP,
    initialPR,
    lowestSupinePR,
    measurements,
    stats,
    chartImage,
    testResult,
    generatedAt,
    clinicName = 'Medical Clinic',
    clinicAddress,
    clinicPhone,
    includeClinicalInterpretation,
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>NASA 10-Minute Lean</Text>
          <Text style={styles.subtitle}>Summary of test results</Text>
          
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text style={styles.patientInfo}>Patient: {patientName}</Text>
              <Text style={styles.patientInfo}>Test Date: {testDate}</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text style={styles.patientInfo}>{clinicName}</Text>
              {clinicAddress && <Text style={styles.patientInfo}>{clinicAddress}</Text>}
              {clinicPhone && <Text style={styles.patientInfo}>{clinicPhone}</Text>}
            </View>
          </View>
        </View>

        {/* Key Results */}
        <View style={styles.resultBox}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Lowest HR</Text>
            <Text style={styles.resultValue}>
              {stats.lowest} bpm
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Highest HR</Text>
            <Text style={styles.resultValue}>
              {stats.highest} bpm
            </Text>
          </View>
          
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>HR Increase</Text>
            <Text style={stats.delta >= 30 ? styles.resultValuePositive : styles.resultValueNegative}>
              +{stats.delta} bpm
            </Text>
          </View>
        </View>

        {/* Baseline Measurements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Baseline Measurements</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text>Blood Pressure: {initialBP.systolic}/{initialBP.diastolic} mmHg</Text>
              <Text>Initial Pulse Rate: {initialPR} bpm</Text>
            </View>
            <View style={styles.lastColumn}>
              <Text>Lowest Supine HR: {lowestSupinePR} bpm</Text>
              <Text>Measurements Recorded: {measurements.length}</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        {chartImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Heart Rate During Test</Text>
            <Image 
              src={chartImage} 
              style={[styles.chart, { width: 450, height: 250 }]}
            />
          </View>
        )}

        {/* Measurements Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standing Phase Measurements</Text>
          <View style={styles.measurementsTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Time</Text>
              <Text style={styles.tableCell}>Heart Rate (bpm)</Text>
              <Text style={styles.tableCellLeft}>Symptoms</Text>
            </View>
            
            {/* Table Rows - Show first 15 measurements to fit on page */}
            {measurements.slice(0, 15).map((measurement, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{measurement.label}</Text>
                <Text style={styles.tableCell}>{measurement.pulseRate}</Text>
                <Text style={styles.tableCellLeft}>
                  {measurement.symptoms || ''}
                </Text>
              </View>
            ))}
            
            {measurements.length > 15 && (
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLeft}>
                  ... and {measurements.length - 15} more measurements
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Clinical Interpretation - Conditional */}
        {includeClinicalInterpretation && (
          <View style={styles.interpretation}>
            <Text style={styles.sectionTitle}>Clinical Interpretation</Text>
            <Text>
              {testResult === 'POSITIVE' 
                ? `The heart rate increase of ${stats.delta} bpm meets the criteria for POTS (>=30 bpm increase). This suggests possible orthostatic intolerance.`
                : `The heart rate increase of ${stats.delta} bpm does not meet the criteria for POTS (<30 bpm increase). This is within normal limits.`
              }
            </Text>
            <Text style={{ marginTop: 8, fontSize: 10, fontStyle: 'italic' }}>
              Note: This test result should be interpreted by a qualified healthcare provider in conjunction with clinical symptoms and other diagnostic findings.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Report generated on {generatedAt}</Text>
          <Text>For questions about this report, please contact your healthcare provider</Text>
        </View>
      </Page>
    </Document>
  );
};