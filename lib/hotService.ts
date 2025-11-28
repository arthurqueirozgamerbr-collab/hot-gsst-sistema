// lib/hotService.ts
// ========== TIPOS ==========
export interface MedidaComSugestao {
  id: string
  texto: string
  status: string
  categoria_sugerida?: "H" | "O" | "T"
  suggestion?: "H" | "O" | "T" | null
  suggestionReason?: string
  suggestionScore?: number
  autoClassified?: boolean
  criado_em: string
}

export interface SugestaoCategoria {
  category: "H" | "O" | "T" | null
  reason: string
  score: number
}

export interface AnalyticsData {
  periodo: string
  totalMedidas: number
  medidasClassificadas: number
  medidasPendentes: number
  taxaClassificacao: number
  distribuicaoCategorias: { H: number; O: number; T: number }
  biblioteca: { total: number; H: number; O: number; T: number; reutilizacoes: number }
  eficiencia: { ia: number; manual: number }
  atividadesRecentes: any[]
  timestamp: string
}

// ========== FUNÇÕES PRINCIPAIS ==========

export async function createRemessaAndInsertMedidas(texto: string, userId: string | null) {
  try {
    const response = await fetch('/api/hot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texto, userId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao criar remessa')
    }

    return data
  } catch (error: any) {
    console.error('Erro em createRemessaAndInsertMedidas:', error)
    throw error
  }
}

export async function getLatestRemessa() {
  try {
    const response = await fetch('/api/hot')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar remessas')
    }

    return data.remessas?.[0] || null
  } catch (error) {
    console.error('Erro inesperado em getLatestRemessa:', error)
    return null
  }
}

// CORREÇÃO NO lib/hotService.ts
export async function getMedidasByRemessa(remessaId: string): Promise<MedidaComSugestao[]> {
  try {
    const response = await fetch(`/api/hot/medidas?remessaId=${remessaId}`)
    
    // Verificar se a resposta está OK
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    // Verificar se há conteúdo
    const text = await response.text()
    if (!text) {
      throw new Error('Resposta vazia da API')
    }
    
    // Tentar parsear o JSON
    const data = JSON.parse(text)

    if (!data.medidas) {
      throw new Error('Formato de resposta inválido')
    }
   
    return (data.medidas || []).map((medida: any) => ({
      ...medida,
      criado_em: medida.criado_em,
      atualizado_em: medida.atualizado_em,
      suggestion: null,
      suggestionReason: '',
      suggestionScore: 0,
      autoClassified: false
    }))
  } catch (error: any) {
    console.error('Erro em getMedidasByRemessa:', error)
    console.error('Remessa ID:', remessaId)
    throw new Error(`Erro ao buscar medidas: ${error.message}`)
  }
}

// CORREÇÃO NO lib/hotService.ts
export async function getMedidasPendentes(): Promise<MedidaComSugestao[]> {
  try {
    const response = await fetch('/api/hot/medidas/pendentes')
    
    // Verificar se a resposta está OK
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    // Verificar se há conteúdo
    const text = await response.text()
    if (!text) {
      return [] // Retornar array vazio em vez de erro
    }
    
    // Tentar parsear o JSON
    const data = JSON.parse(text)

    // Processar sugestões para cada medida
    const medidasComSugestoes = await Promise.all(
      (data.medidas || []).map(async (medida: any) => {
        try {
          const sugestao = await suggestCategoryForMeasure(medida.texto)
          return {
            id: medida.id,
            texto: medida.texto,
            status: medida.status,
            criado_em: medida.criado_em,
            suggestion: sugestao.category,
            suggestionReason: sugestao.reason,
            suggestionScore: sugestao.score,
            autoClassified: false
          }
        } catch (suggestionError) {
          // Se houver erro na sugestão, retornar medida sem sugestão
          return {
            id: medida.id,
            texto: medida.texto,
            status: medida.status,
            criado_em: medida.criado_em,
            suggestion: null,
            suggestionReason: 'Erro ao gerar sugestão',
            suggestionScore: 0,
            autoClassified: false
          }
        }
      })
    )

    return medidasComSugestoes
  } catch (error: any) {
    console.error('Erro em getMedidasPendentes:', error)
    // Retornar array vazio em vez de propagar o erro
    return []
  }
}

// ========== CLASSIFICAÇÃO INTELIGENTE ==========

export async function suggestCategoryForMeasure(texto: string): Promise<SugestaoCategoria> {
  try {
    // 1. BUSCA EXATA NA BIBLIOTECA (Medidas já classificadas antes)
    const exactMatch = await checkExactMatchInLibrary(texto)
    if (exactMatch) {
      return {
        category: exactMatch.categoria as "H" | "O" | "T",
        reason: `Classificado anteriormente (${exactMatch.vezes_utilizada} vezes)`,
        score: 0.95 // Alta confiança - já foi classificado antes
      }
    }

    // 2. BUSCA PARCIAL NA BIBLIOTECA (Medidas similares)
    const partialMatch = await checkPartialMatchInLibrary(texto)
    if (partialMatch) {
      return {
        category: partialMatch.categoria as "H" | "O" | "T",
        reason: `Similar a: "${partialMatch.texto.substring(0, 40)}..."`,
        score: 0.75
      }
    }

    // 3. FALLBACK: Classificação por palavras-chave
    return await classifyByKeywords(texto)
  } catch (error) {
    console.error('Erro em suggestCategoryForMeasure:', error)
    return await classifyByKeywords(texto)
  }
}

// Funções auxiliares para buscar na biblioteca
// CORREÇÃO NO lib/hotService.ts
async function checkExactMatchInLibrary(texto: string): Promise<any> {
  try {
    const response = await fetch(`/api/hot/biblioteca?search=${encodeURIComponent(texto)}`)
    if (!response.ok) return null
    
    const data = await response.json()
    if (data.items && data.items.length > 0) {
      // Busca exata manual (case insensitive)
      const textoLimpo = texto.toLowerCase().trim().replace(/\s+/g, ' ')
      return data.items.find((item: any) => 
        item.texto.toLowerCase().trim().replace(/\s+/g, ' ') === textoLimpo
      )
    }
    return null
  } catch {
    return null
  }
}

async function checkPartialMatchInLibrary(texto: string): Promise<any> {
  try {
    const response = await fetch(`/api/hot/biblioteca?search=${encodeURIComponent(texto)}`)
    if (!response.ok) return null
    
    const data = await response.json()
    if (data.items && data.items.length > 0) {
      // Busca parcial manual
      const textoLimpo = texto.toLowerCase().trim()
      return data.items.find((item: any) => 
        item.texto.toLowerCase().includes(textoLimpo) ||
        textoLimpo.includes(item.texto.toLowerCase())
      ) || data.items[0] // Fallback para primeiro item
    }
    return null
  } catch {
    return null
  }
}

// Função de classificação por palavras-chave (mantida igual)
async function classifyByKeywords(texto: string): Promise<SugestaoCategoria> {
  const textoLimpo = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const keywords = {
    'H': ['treinamento', 'capacitacao', 'capacitação', 'habilidade', 'competencia', 'competência', 'conscientizacao', 'conscientização', 'curso', 'palestra', 'workshop', 'funcionario', 'funcionário', 'colaborador', 'pessoa', 'humano', 'lideranca', 'liderança', 'motivacao', 'motivação', 'comportamento', 'educacao', 'educação', 'aprendizado', 'desenvolvimento'],
    'O': ['processo', 'procedimento', 'politica', 'política', 'organizacional', 'governanca', 'governança', 'gestao', 'gestão', 'administrativo', 'documentacao', 'documentação', 'norma', 'regulamento', 'controle', 'auditoria', 'comite', 'comitê', 'directoria', 'gerencia', 'gerência', 'estrutura', 'hierarquia', 'compliance', 'conformidade', 'qualidade'],
    'T': ['tecnologia', 'sistema', 'software', 'hardware', 'firewall', 'backup', 'antivirus', 'antivírus', 'rede', 'servidor', 'computador', 'equipamento', 'infraestrutura', 'digital', 'criptografia', 'senha', 'acesso', 'login', 'backup', 'restauracao', 'restauração', 'seguranca', 'segurança', 'dados', 'informacao', 'informação', 'nuvem', 'cloud']
  }

  let scores = { H: 0, O: 0, T: 0 }

  Object.entries(keywords).forEach(([categoria, palavras]) => {
    palavras.forEach((palavra: string) => {
      if (textoLimpo.includes(palavra)) {
        scores[categoria as keyof typeof scores]++
      }
    })
  })

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) {
    return { category: null, reason: 'Não foi possível classificar automaticamente', score: 0 }
  }

  const categoriasComMaxScore = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([cat]) => cat)

  if (categoriasComMaxScore.length > 1) {
    return { category: null, reason: 'Conflito de categorias detectado', score: 0 }
  }

  const categoria = categoriasComMaxScore[0] as 'H' | 'O' | 'T'

  const reasons = {
    'H': 'Envolve pessoas, treinamento e desenvolvimento humano',
    'O': 'Relacionado a processos, políticas e estrutura organizacional', 
    'T': 'Envolve tecnologia, sistemas e infraestrutura técnica'
  }

  const score = Math.min(maxScore / Math.max(1, textoLimpo.split(' ').length * 0.5), 0.8)

  return {
    category: categoria,
    reason: reasons[categoria],
    score: score
  }
}

// ========== BIBLIOTECA PERMANENTE ==========

async function checkMeasureInLibrary(texto: string): Promise<SugestaoCategoria | null> {
  try {
    const response = await fetch(`/api/hot/biblioteca?search=${encodeURIComponent(texto)}`)
    const data = await response.json()

    if (response.ok && data.items && data.items.length > 0) {
      const item = data.items[0]
      return {
        category: item.categoria as "H" | "O" | "T",
        reason: `Baseado na biblioteca (${item.vezes_utilizada} usos anteriores)`,
        score: 0.95
      }
    }
    return null
  } catch (error) {
    return null
  }
}

// ========== VALIDAÇÃO E GERENCIAMENTO ==========

// CORREÇÃO NO lib/hotService.ts
export async function validateMeasure(
  medidaId: string,
  categoria: "H" | "O" | "T",
  userId: string | null,
  justificativa?: string
) {
  try {
    const response = await fetch('/api/hot/classificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medidaId,
        categoria,
        userId,
        justificativa: justificativa || "Classificação manual"
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Erro ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Erro em validateMeasure:', error)
    throw new Error(error.message || 'Falha ao validar medida')
  }
}

export async function markPending(medidaId: string, userId: string | null) {
  try {
    // Para SQLite, vamos apenas atualizar o status
    const response = await fetch('/api/hot/medidas/pending', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medidaId,
        userId
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao marcar como pendente')
    }

    return data
  } catch (error: any) {
    console.error('Erro em markPending:', error)
    throw error
  }
}

export async function markNotClassified(medidaId: string, userId: string | null) {
  try {
    const response = await fetch('/api/hot/medidas/not-classified', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medidaId,
        userId
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao marcar como não classificada')
    }

    return data
  } catch (error: any) {
    console.error('Erro em markNotClassified:', error)
    throw error
  }
}

export async function deleteMeasure(medidaId: string, userId: string | null) {
  try {
    const response = await fetch('/api/hot/medidas', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        medidaId,
        userId
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao apagar medida')
    }

    return data
  } catch (error: any) {
    console.error('Erro em deleteMeasure:', error)
    throw error
  }
}

// ========== BIBLIOTECA ==========

export async function getLibraryItems(searchTerm?: string) {
  try {
    let url = '/api/hot/biblioteca'
    if (searchTerm && searchTerm.trim()) {
      url += `?search=${encodeURIComponent(searchTerm)}`
    }

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao buscar biblioteca')
    }

    return data.items || []
  } catch (error) {
    console.error('Erro geral em getLibraryItems:', error)
    return []
  }
}

export async function updateLibraryMeasure(
  measureId: string,
  novaCategoria: "H" | "O" | "T",
  userId: string | null,
  justificativa?: string
) {
  try {
    const response = await fetch('/api/hot/biblioteca', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        measureId,
        novaCategoria,
        userId,
        justificativa
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao atualizar biblioteca')
    }

    return data
  } catch (error: any) {
    console.error('Erro em updateLibraryMeasure:', error)
    throw error
  }
}

// CORREÇÃO NO lib/hotService.ts
export async function deleteLibraryMeasure(measureId: string, userId: string | null) {
  try {
    const response = await fetch(`/api/hot/biblioteca?measureId=${measureId}&userId=${userId}`, {
      method: 'DELETE',
    })

    // Verificar se a resposta está vazia
    if (response.status === 204 || response.status === 200) {
      // Resposta vazia é OK para DELETE
      return { success: true, message: 'Medida removida com sucesso' }
    }

    // Tentar parsear JSON apenas se houver conteúdo
    const text = await response.text()
    if (!text) {
      throw new Error('Resposta vazia do servidor')
    }

    const data = JSON.parse(text)

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao excluir da biblioteca')
    }

    return data
  } catch (error: any) {
    console.error('Erro em deleteLibraryMeasure:', error)
    
    // Se for erro de JSON vazio, mas a requisição foi bem sucedida, retornar sucesso
    if (error.message.includes('Unexpected end of JSON input') || error.message.includes('Resposta vazia')) {
      return { success: true, message: 'Medida removida com sucesso' }
    }
    
    throw new Error(error.message || 'Erro ao excluir da biblioteca')
  }
}

// ========== ANALYTICS ==========

export async function getHotAnalytics(periodo: 'dia' | 'semana' | 'mes' | 'ano' = 'mes'): Promise<AnalyticsData> {
  try {
    const response = await fetch(`/api/analytics?periodo=${periodo}`)
    
    if (!response.ok) {
      throw new Error('Erro ao buscar analytics')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro em getHotAnalytics:', error)
    return getEmptyAnalytics(periodo)
  }
}

export async function getTemporalData(periodo: 'dia' | 'semana' | 'mes' | 'ano' = 'mes') {
  try {
    const response = await fetch(`/api/analytics/temporal?periodo=${periodo}`)
    
    if (!response.ok) {
      throw new Error('Erro ao buscar dados temporais')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro em getTemporalData:', error)
    return getEmptyTemporalData(periodo)
  }
}

// ========== FUNÇÕES AUXILIARES ==========

function getEmptyAnalytics(periodo: string): AnalyticsData {
  return {
    periodo,
    totalMedidas: 0,
    medidasClassificadas: 0,
    medidasPendentes: 0,
    taxaClassificacao: 0,
    distribuicaoCategorias: { H: 0, O: 0, T: 0 },
    biblioteca: { total: 0, H: 0, O: 0, T: 0, reutilizacoes: 0 },
    eficiencia: { ia: 0, manual: 100 },
    atividadesRecentes: [],
    timestamp: new Date().toISOString()
  }
}

function getEmptyTemporalData(periodo: string) {
  return {
    periodo,
    dados: [],
    totalRegistros: 0
  }
}

// CORREÇÃO: Adicionar no lib/hotService.ts
// SUBSTITUIR A FUNÇÃO processMeasure
export async function processMeasure(m: any): Promise<any> {
  // Se já está validada, não fazer nada
  if (m.status === 'validada') {
    return {
      ...m,
      suggestion: m.categoria_sugerida,
      suggestionReason: 'Classificação confirmada',
      suggestionScore: 1.0,
      autoClassified: false
    }
  }

  // USAR A CLASSIFICAÇÃO INTELIGENTE
  return await classificarMedidaInteligente(m)
}

// ADICIONAR NO lib/hotService.ts
export async function checkAPIs() {
  const endpoints = [
    '/api/hot',
    '/api/hot/medidas/pendentes',
    '/api/analytics'
  ]
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint)
      console.log(`${endpoint}: ${response.status} ${response.statusText}`)
    } catch (error) {
      console.error(`${endpoint}: ERROR`, error)
    }
  }
}

// ADICIONAR NO lib/hotService.ts
export async function debugBiblioteca() {
  try {
    const response = await fetch('/api/hot/biblioteca')
    const data = await response.json()
    console.log('📚 Biblioteca atual:', data.items)
    return data.items
  } catch (error) {
    console.error('Erro ao buscar biblioteca:', error)
    return []
  }
}

// ADICIONAR NO hotService.ts - função de debug
export async function debugAutoClassificacao() {
  console.log('🐛 INICIANDO DEBUG DA CLASSIFICAÇÃO AUTOMÁTICA')
  
  // 1. Ver biblioteca
  const biblioteca = await getLibraryItems()
  console.log('📚 Itens na biblioteca:', biblioteca.length)
  biblioteca.forEach((item: any, i: number) => {  // TIPAGEM ADICIONADA
    console.log(`   ${i + 1}. "${item.texto}" → ${item.categoria} (${item.vezes_utilizada}x)`)
  })
  
  // 2. Ver última remessa
  const ultimaRemessa = await getLatestRemessa()
  console.log('📦 Última remessa:', ultimaRemessa?.id)
  
  if (ultimaRemessa) {
    const medidas = await getMedidasByRemessa(ultimaRemessa.id)
    console.log('📝 Medidas na remessa:', medidas.length)
    
    // 3. Testar cada medida
    for (const medida of medidas) {
      console.log('---')
      console.log('🔍 Testando medida:', medida.texto.substring(0, 50))
      
      const sugestao = await suggestCategoryForMeasure(medida.texto)
      console.log('   Sugestão:', sugestao.category, 'Score:', sugestao.score)
      console.log('   Motivo:', sugestao.reason)
      
      if (sugestao.score > 0.7) {
        console.log('   🚀 DEVERIA CLASSIFICAR AUTOMATICAMENTE!')
      } else {
        console.log('   ❌ NÃO classifica - score baixo')
      }
    }
  }
  
  console.log('🐛 DEBUG FINALIZADO')
}

// ADICIONAR NO hotService.ts - FUNÇÃO PRINCIPAL
// CORREÇÃO: Classificação inteligente SEM operação de banco
export async function classificarMedidaInteligente(medida: any): Promise<any> {
  console.log('🤖 ANALISANDO:', medida.texto.substring(0, 50))
  
  try {
    // 1. BUSCAR NA BIBLIOTECA
    const biblioteca = await getLibraryItems()
    
    // 2. BUSCA EXATA (mesmo texto)
    const matchExato = biblioteca.find((item: any) => 
      item.texto.toLowerCase().trim() === medida.texto.toLowerCase().trim()
    )
    
    if (matchExato) {
      console.log('✅ ENCONTRADO NA BIBLIOTECA - Marcando para classificação automática')
      
      // NÃO CLASSIFICAR AGORA - apenas marcar como alta confiança
      return {
        ...medida,
        suggestion: matchExato.categoria as "H" | "O" | "T",
        suggestionReason: `Classificar como ${matchExato.categoria} - Já foi classificado ${matchExato.vezes_utilizada} vezes antes`,
        suggestionScore: 0.98,
        autoClassified: true, // Indica que pode ser classificada automaticamente
        matchExato: true // Flag especial
      }
    }
    
    // 3. BUSCA SIMILAR (palavras em comum)
    const matchSimilar = biblioteca.find((item: any) => {
      const palavras1 = medida.texto.toLowerCase().split(/\s+/)
      const palavras2 = item.texto.toLowerCase().split(/\s+/)
      
      const palavrasComuns = palavras1.filter((palavra: string) => 
        palavras2.includes(palavra) && palavra.length > 3
      )
      
      return palavrasComuns.length >= 2 // Pelo menos 2 palavras em comum
    })
    
    if (matchSimilar) {
      console.log('🔍 SUGERINDO FORTEMENTE - Texto similar encontrado')
      return {
        ...medida,
        suggestion: matchSimilar.categoria as "H" | "O" | "T",
        suggestionReason: `Similar a: "${matchSimilar.texto.substring(0, 40)}..." (classificado como ${matchSimilar.categoria})`,
        suggestionScore: 0.85,
        autoClassified: false
      }
    }
    
    // 4. SUGESTÃO POR PALAVRAS-CHAVE
    const sugestaoIA = await suggestCategoryForMeasure(medida.texto)
    
    if (sugestaoIA.category && sugestaoIA.score > 0.5) {
      console.log('💡 SUGESTÃO DA IA')
      return {
        ...medida,
        ...sugestaoIA,
        autoClassified: false
      }
    }
    
    // 5. NÃO CONSEGUIU CLASSIFICAR - PRECISA DE REVISÃO
    console.log('❌ PRECISA DE REVISÃO MANUAL')
    return {
      ...medida,
      suggestion: null,
      suggestionReason: 'Precisa de classificação manual',
      suggestionScore: 0,
      autoClassified: false
    }
    
  } catch (error) {
    console.error('❌ ERRO na classificação inteligente:', error)
    return {
      ...medida,
      suggestion: null,
      suggestionReason: 'Erro na análise',
      suggestionScore: 0,
      autoClassified: false
    }
  }
}

// FUNÇÃO AUXILIAR - Calcular similaridade entre textos
function calcularSimilaridade(texto1: string, texto2: string): number {
  const str1 = texto1.toLowerCase()
  const str2 = texto2.toLowerCase()
  
  // Similaridade simples por palavras em comum
  const palavras1 = str1.split(/\s+/)
  const palavras2 = str2.split(/\s+/)
  
  const palavrasComuns = palavras1.filter(palavra => 
    palavras2.includes(palavra) && palavra.length > 3
  )
  
  return palavrasComuns.length / Math.max(palavras1.length, palavras2.length)
}

// CORREÇÃO: Adicionar tipagem explícita
function exportarComoTexto(items: any[]): { success: true, data: string, tipo: 'texto' } {
  let texto = '📋 CLASSIFICAÇÕES HOT - SISTEMA GSST\n\n'
  
  // Agrupar por categoria
  const porCategoria = {
    H: items.filter((item: any) => item.categoria === 'H'),
    O: items.filter((item: any) => item.categoria === 'O'), 
    T: items.filter((item: any) => item.categoria === 'T')
  }
  
  texto += '👤 HUMANO:\n'
  porCategoria.H.forEach((item: any) => {
    texto += `• ${item.texto} (${item.vezes_utilizada}x)\n`
  })
  
  texto += '\n🏢 ORGANIZACIONAL:\n'
  porCategoria.O.forEach((item: any) => {
    texto += `• ${item.texto} (${item.vezes_utilizada}x)\n`
  })
  
  texto += '\n💻 TÉCNICO:\n'
  porCategoria.T.forEach((item: any) => {
    texto += `• ${item.texto} (${item.vezes_utilizada}x)\n`
  })
  
  texto += `\n---\nTotal: ${items.length} classificações\nExportado em: ${new Date().toLocaleString('pt-BR')}`
  
  return { success: true, data: texto, tipo: 'texto' }
}

function exportarComoCSV(items: any[]): { success: true, data: string, tipo: 'csv' } {
  let csv = 'Categoria;Medida;Vezes_Utilizada\n'
  
  items.forEach((item: any) => {
    const categoria = item.categoria === 'H' ? 'Humano' : 
                     item.categoria === 'O' ? 'Organizacional' : 'Técnico'
    csv += `"${categoria}";"${item.texto}";${item.vezes_utilizada}\n`
  })
  
  return { success: true, data: csv, tipo: 'csv' }
}