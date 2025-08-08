import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { ROIResults } from '@/types'
import { formatCurrency, formatPercentage } from '@/lib/utils'

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPDF = async (elementId: string, filename: string = 'fertility-benefits-report') => {
    setIsExporting(true)
    
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 30

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${filename}.pdf`)
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  const exportROIToExcel = (roiData: ROIResults, filename: string = 'roi-calculation') => {
    const csvContent = generateROICSV(roiData)
    downloadCSV(csvContent, `${filename}.csv`)
  }

  const generateROICSV = (data: ROIResults): string => {
    const rows = [
      ['Fertility Benefits ROI Analysis'],
      [''],
      ['Company Information'],
      ['Industry', data.calculationParameters.industry],
      ['Company Size', data.calculationParameters.companySize.toString()],
      ['Size Category', data.calculationParameters.sizeCategory],
      [''],
      ['Annual Costs'],
      ['Total Program Cost', formatCurrency(data.costs.annualProgramCost)],
      ['Cost Per Employee', formatCurrency(data.costs.costPerEmployee)],
      [''],
      ['Annual Benefits'],
      ['Recruitment Savings', formatCurrency(data.benefits.recruitmentSavings)],
      ['Healthcare Savings', formatCurrency(data.benefits.healthcareSavings)],
      ['Productivity Savings', formatCurrency(data.benefits.productivitySavings)],
      ['Total Annual Benefits', formatCurrency(data.benefits.totalAnnualBenefits)],
      [''],
      ['ROI Metrics'],
      ['Annual ROI', formatPercentage(data.roi.annualROI)],
      ['ROI Multiplier', `${data.roi.roiMultiplier.toFixed(2)}x`],
      ['Annual Net Benefit', formatCurrency(data.roi.annualNetBenefit)],
      ['Payback Period (months)', data.roi.paybackPeriod.toFixed(1)],
      [''],
      ['5-Year Projections'],
      ['5-Year Program Cost', formatCurrency(data.costs.fiveYearProgramCost)],
      ['5-Year Benefits', formatCurrency(data.benefits.fiveYearBenefits)],
      ['5-Year ROI', formatPercentage(data.roi.fiveYearROI)],
      ['5-Year Net Benefit', formatCurrency(data.roi.fiveYearNetBenefit)],
      [''],
      ['Employee Impact'],
      ['Satisfaction Increase', formatPercentage(data.employeeImpact.satisfactionIncrease * 100)],
      ['Retention Increase', formatPercentage(data.employeeImpact.retentionIncrease)],
      ['Employees Helped (Est.)', data.employeeImpact.estimatedEmployeesHelped.toString()],
      ['Current Turnover Rate', formatPercentage(data.employeeImpact.currentTurnoverRate)],
      ['New Turnover Rate', formatPercentage(data.employeeImpact.newTurnoverRate)],
    ]

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return {
    exportToPDF,
    exportROIToExcel,
    isExporting
  }
}