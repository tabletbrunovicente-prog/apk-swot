'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit3, Download, Upload, RotateCcw, AlertTriangle, TrendingUp, Target, BarChart3, Star, AlertCircle, FileText, Trash2, User } from 'lucide-react'
import jsPDF from 'jspdf'

type Priority = 'baixa' | 'media' | 'alta' | 'critica'

interface SWOTItem {
  id: string
  text: string
  priority: Priority
  responsible: string
  createdAt: number
}

interface SWOTData {
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
}

interface AnalysisResult {
  category: string
  item: SWOTItem
  impact: string
  recommendation: string
  urgency: number
}

export default function SWOTAnalysis() {
  const [swotData, setSWOTData] = useState<SWOTData>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  })

  const [editingItem, setEditingItem] = useState<{ category: keyof SWOTData, id: string } | null>(null)
  const [editText, setEditText] = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('media')
  const [editResponsible, setEditResponsible] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [newItemPriority, setNewItemPriority] = useState<Priority>('media')
  const [newItemResponsible, setNewItemResponsible] = useState('')
  const [activeCategory, setActiveCategory] = useState<keyof SWOTData | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const validateSWOTData = (data: any): SWOTData => {
    const defaultData: SWOTData = { strengths: [], weaknesses: [], opportunities: [], threats: [] }
    if (!data || typeof data !== 'object') return defaultData

    const validatedData: SWOTData = { ...defaultData }

    Object.keys(defaultData).forEach(key => {
      const categoryKey = key as keyof SWOTData
      if (Array.isArray(data[categoryKey])) {
        validatedData[categoryKey] = data[categoryKey]
          .filter((item: any) => item && typeof item === 'object' && item.text)
          .map((item: any) => ({
            id: item.id || generateId(),
            text: item.text || '',
            priority: ['baixa', 'media', 'alta', 'critica'].includes(item.priority) ? item.priority : 'media',
            responsible: item.responsible || '',
            createdAt: item.createdAt || Date.now()
          }))
      }
    })
    return validatedData
  }

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('swot-analysis')
      if (savedData) setSWOTData(validateSWOTData(JSON.parse(savedData)))
    } catch (error) {
      console.error('Erro ao carregar:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('swot-analysis', JSON.stringify(swotData))
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }, [swotData])

  const addItem = (category: keyof SWOTData, text: string, priority: Priority, responsible: string) => {
    if (!text.trim()) return
    const newItem: SWOTItem = {
      id: generateId(),
      text: text.trim(),
      priority,
      responsible: responsible.trim(),
      createdAt: Date.now()
    }
    setSWOTData(prev => ({
      ...prev,
      [category]: [...prev[category], newItem]
    }))
    setNewItemText('')
    setNewItemPriority('media')
    setNewItemResponsible('')
    setActiveCategory(null)
  }

  const removeItem = (category: keyof SWOTData, id: string) => {
    setSWOTData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }))
  }

  const startEdit = (category: keyof SWOTData, id: string, currentText: string, currentPriority: Priority, currentResponsible: string) => {
    setEditingItem({ category, id })
    setEditText(currentText)
    setEditPriority(currentPriority)
    setEditResponsible(currentResponsible)
  }

  const saveEdit = () => {
    if (!editingItem || !editText.trim()) return
    setSWOTData(prev => ({
      ...prev,
      [editingItem.category]: prev[editingItem.category].map(item =>
        item.id === editingItem.id ? { ...item, text: editText.trim(), priority: editPriority, responsible: editResponsible.trim() } : item
      )
    }))
    setEditingItem(null)
    setEditText('')
    setEditPriority('media')
    setEditResponsible('')
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditText('')
    setEditPriority('media')
    setEditResponsible('')
  }

  const clearAll = () => {
    const confirma = window.confirm('Tem certeza que deseja limpar toda a análise SWOT?')
    if (confirma) {
      setSWOTData({
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      })
      setShowAnalysis(false)
      setAnalysisResults([])
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critica': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPriorityText = (priority: Priority): string =>
    priority.charAt(0).toUpperCase() + priority.slice(1)

  const getPriorityIcon = (priority: Priority) => {
    const color = {
      baixa: 'bg-green-500',
      media: 'bg-yellow-500',
      alta: 'bg-orange-500',
      critica: 'bg-red-500'
    }[priority]
    return <div className={`w-2 h-2 ${color} rounded-full`} />
  }

  const generateAnalysis = () => {
    const results: AnalysisResult[] = []
    
    // Análise de Forças
    swotData.strengths.forEach(item => {
      results.push({
        category: 'Força',
        item,
        impact: 'Potencializa competitividade e diferenciação no mercado',
        recommendation: 'Maximize esta força através de investimentos estratégicos e comunicação efetiva',
        urgency: item.priority === 'critica' ? 5 : item.priority === 'alta' ? 4 : item.priority === 'media' ? 3 : 2
      })
    })

    // Análise de Fraquezas
    swotData.weaknesses.forEach(item => {
      results.push({
        category: 'Fraqueza',
        item,
        impact: 'Reduz eficiência operacional e competitividade',
        recommendation: 'Desenvolva plano de ação imediato para mitigar esta fraqueza',
        urgency: item.priority === 'critica' ? 5 : item.priority === 'alta' ? 4 : item.priority === 'media' ? 3 : 2
      })
    })

    // Análise de Oportunidades
    swotData.opportunities.forEach(item => {
      results.push({
        category: 'Oportunidade',
        item,
        impact: 'Potencial de crescimento e expansão de mercado',
        recommendation: 'Avalie viabilidade e desenvolva estratégia de aproveitamento',
        urgency: item.priority === 'critica' ? 5 : item.priority === 'alta' ? 4 : item.priority === 'media' ? 3 : 2
      })
    })

    // Análise de Ameaças
    swotData.threats.forEach(item => {
      results.push({
        category: 'Ameaça',
        item,
        impact: 'Risco de perda de mercado e redução de receita',
        recommendation: 'Implemente medidas preventivas e planos de contingência',
        urgency: item.priority === 'critica' ? 5 : item.priority === 'alta' ? 4 : item.priority === 'media' ? 3 : 2
      })
    })

    return results.sort((a, b) => b.urgency - a.urgency)
  }

  // Função para gerar análise e atualizar estado
  const handleGenerateAnalysis = () => {
    if (showAnalysis) {
      setShowAnalysis(false)
      setAnalysisResults([])
    } else {
      const results = generateAnalysis()
      setAnalysisResults(results)
      setShowAnalysis(true)
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // Título principal
      doc.setFontSize(20)
      doc.text('Análise SWOT Completa', 20, yPosition)
      yPosition += 15

      // Data de geração
      doc.setFontSize(10)
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition)
      yPosition += 20

      // Seção 1: Dados SWOT
      doc.setFontSize(18)
      doc.text('1. Dados SWOT', 20, yPosition)
      yPosition += 15

      const categories = [
        { key: 'strengths', title: 'Forças' },
        { key: 'weaknesses', title: 'Fraquezas' },
        { key: 'opportunities', title: 'Oportunidades' },
        { key: 'threats', title: 'Ameaças' }
      ]

      categories.forEach(({ key, title }) => {
        const items = swotData[key as keyof SWOTData]
        if (items.length > 0) {
          doc.setFontSize(16)
          doc.text(title, 20, yPosition)
          yPosition += 10

          items.forEach((item, index) => {
            doc.setFontSize(12)
            const responsibleText = item.responsible ? ` - Responsável: ${item.responsible}` : ''
            const text = `${index + 1}. ${item.text} (${formatPriorityText(item.priority)})${responsibleText}`
            const splitText = doc.splitTextToSize(text, 170)
            doc.text(splitText, 25, yPosition)
            yPosition += splitText.length * 5 + 5

            if (yPosition > 270) {
              doc.addPage()
              yPosition = 20
            }
          })
          yPosition += 10
        }
      })

      // Seção 2: Análise Estratégica (se disponível)
      if (showAnalysis && analysisResults.length > 0) {
        // Nova página para análise
        doc.addPage()
        yPosition = 20

        doc.setFontSize(18)
        doc.text('2. Análise Estratégica', 20, yPosition)
        yPosition += 15

        doc.setFontSize(12)
        doc.text('Resultados priorizados por criticidade:', 20, yPosition)
        yPosition += 15

        analysisResults.forEach((result, index) => {
          // Verificar se precisa de nova página
          if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
          }

          doc.setFontSize(14)
          doc.text(`${index + 1}. ${result.category}: ${result.item.text}`, 20, yPosition)
          yPosition += 8

          doc.setFontSize(10)
          doc.text(`Prioridade: ${formatPriorityText(result.item.priority)}`, 25, yPosition)
          yPosition += 5

          if (result.item.responsible) {
            doc.text(`Responsável: ${result.item.responsible}`, 25, yPosition)
            yPosition += 5
          }

          doc.setFontSize(11)
          const impactText = doc.splitTextToSize(`Impacto: ${result.impact}`, 165)
          doc.text(impactText, 25, yPosition)
          yPosition += impactText.length * 5 + 3

          const recommendationText = doc.splitTextToSize(`Recomendação: ${result.recommendation}`, 165)
          doc.text(recommendationText, 25, yPosition)
          yPosition += recommendationText.length * 5 + 8

          // Linha separadora
          doc.setDrawColor(200, 200, 200)
          doc.line(20, yPosition, 190, yPosition)
          yPosition += 8
        })
      }

      doc.save('analise-swot-completa.pdf')
      alert('PDF exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar PDF:', error)
      alert('Erro ao exportar PDF. Verifique se há dados para exportar.')
    }
  }

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(swotData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'analise-swot.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      alert('JSON exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar JSON:', error)
      alert('Erro ao exportar JSON.')
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        const validatedData = validateSWOTData(importedData)
        setSWOTData(validatedData)
        alert('Dados importados com sucesso!')
        // Limpar o input
        event.target.value = ''
      } catch (error) {
        console.error('Erro ao importar:', error)
        alert('Erro ao importar arquivo. Verifique se é um JSON válido.')
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const getCategoryTitle = (category: keyof SWOTData) => {
    const titles = {
      strengths: 'Forças',
      weaknesses: 'Fraquezas', 
      opportunities: 'Oportunidades',
      threats: 'Ameaças'
    }
    return titles[category]
  }

  const getCategoryIcon = (category: keyof SWOTData) => {
    const icons = {
      strengths: <Star className="w-5 h-5 text-green-600" />,
      weaknesses: <AlertTriangle className="w-5 h-5 text-red-600" />,
      opportunities: <TrendingUp className="w-5 h-5 text-blue-600" />,
      threats: <AlertCircle className="w-5 h-5 text-orange-600" />
    }
    return icons[category]
  }

  const getCategoryColor = (category: keyof SWOTData) => {
    const colors = {
      strengths: 'border-green-200 bg-green-50',
      weaknesses: 'border-red-200 bg-red-50',
      opportunities: 'border-blue-200 bg-blue-50',
      threats: 'border-orange-200 bg-orange-50'
    }
    return colors[category]
  }

  const totalItems = Object.values(swotData).reduce((sum, items) => sum + items.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Análise SWOT Inteligente</h1>
          <p className="text-gray-600">Ferramenta completa para análise estratégica empresarial</p>
          <div className="mt-4 flex justify-center items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              {totalItems} itens cadastrados
            </span>
          </div>
        </div>

        {/* CONTROLES SUPERIORES */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={handleGenerateAnalysis}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              showAnalysis
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {showAnalysis ? 'Ocultar Análise' : 'Gerar Análise'}
          </button>

          <button
            type="button"
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>

          <button
            type="button"
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar JSON
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar Tudo
          </button>
        </div>

        {/* RESULTADO DA ANÁLISE AUTOMÁTICA */}
        {showAnalysis && (
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Análise Estratégica</h3>
                <p className="text-gray-600 text-sm">Resultados priorizados por criticidade</p>
              </div>
            </div>

            {Object.values(swotData).flat().length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysisResults.map((result, index) => (
                  <div
                    key={`${result.category}-${result.item.id}`}
                    className={`p-4 rounded-lg border-l-4 ${
                      result.urgency === 5
                        ? 'border-red-500 bg-red-50'
                        : result.urgency === 4
                        ? 'border-orange-500 bg-orange-50'
                        : result.urgency === 3
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.category === 'Força'
                                ? 'bg-emerald-100 text-emerald-800'
                                : result.category === 'Fraqueza'
                                ? 'bg-red-100 text-red-800'
                                : result.category === 'Oportunidade'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {result.category}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              result.item.priority
                            )}`}
                          >
                            {formatPriorityText(result.item.priority)}
                          </span>
                          {result.item.responsible && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <User className="w-3 h-3 inline mr-1" />
                              {result.item.responsible}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{result.item.text}</h4>
                        <p className="text-sm text-gray-700 mb-2">{result.impact}</p>
                        <p className="text-sm font-medium text-gray-800">{result.recommendation}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: result.urgency }, (_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">Nenhum item adicionado para análise</p>
            )}
          </div>
        )}

        {/* Grid SWOT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {(['strengths', 'weaknesses', 'opportunities', 'threats'] as (keyof SWOTData)[]).map((category) => (
            <div key={category} className={`bg-white rounded-xl shadow-lg border-2 ${getCategoryColor(category)} p-6 transition-all duration-200 hover:shadow-xl`}>
              {/* Header da Categoria */}
              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-bold text-gray-800">{getCategoryTitle(category)}</h2>
                <span className="ml-auto bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                  {swotData[category].length}
                </span>
              </div>

              {/* Botão Adicionar */}
              <button
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg mb-4 flex items-center justify-center gap-2 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>

              {/* Formulário de Adição */}
              {activeCategory === category && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                  <textarea
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder={`Descreva uma ${getCategoryTitle(category).toLowerCase().slice(0, -1)}...`}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <input
                    type="text"
                    value={newItemResponsible}
                    onChange={(e) => setNewItemResponsible(e.target.value)}
                    placeholder="Responsável (opcional)"
                    className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(e.target.value as Priority)}
                    className="w-full border border-gray-300 p-3 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="baixa">Prioridade Baixa</option>
                    <option value="media">Prioridade Média</option>
                    <option value="alta">Prioridade Alta</option>
                    <option value="critica">Prioridade Crítica</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem(category, newItemText, newItemPriority, newItemResponsible)}
                      disabled={!newItemText.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-medium"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Itens */}
              <div className="space-y-3">
                {swotData[category].length === 0 ? (
                  <p className="text-gray-500 text-center py-8 italic">
                    Nenhum item adicionado ainda
                  </p>
                ) : (
                  swotData[category].map((item) => (
                    <div key={item.id} className="group">
                      {editingItem?.category === category && editingItem?.id === item.id ? (
                        // Modo de Edição
                        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded mb-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                          <input
                            type="text"
                            value={editResponsible}
                            onChange={(e) => setEditResponsible(e.target.value)}
                            placeholder="Responsável (opcional)"
                            className="w-full border border-gray-300 p-2 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="w-full border border-gray-300 p-2 rounded mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="baixa">Prioridade Baixa</option>
                            <option value="media">Prioridade Média</option>
                            <option value="alta">Prioridade Alta</option>
                            <option value="critica">Prioridade Crítica</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-all duration-200 text-sm font-medium"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-200 text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo de Visualização
                        <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-gray-800 text-sm leading-relaxed mb-2">{item.text}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {getPriorityIcon(item.priority)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                  {formatPriorityText(item.priority)}
                                </span>
                                {item.responsible && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                    <User className="w-3 h-3 inline mr-1" />
                                    {item.responsible}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => startEdit(category, item.id, item.text, item.priority, item.responsible)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                                title="Editar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(category, item.id)}
                                className="p-1.5 text-red-600 hover:text-white hover:bg-red-600 rounded transition-colors"
                                title="Excluir item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}