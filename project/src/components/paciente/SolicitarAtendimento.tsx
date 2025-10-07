import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useQueueStore } from '@/stores/queue'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const especialidades = [
  'Dentista',
  'Psicólogo',
  'Médico Clínico'
]

const prioridades = [
  { value: 'baixa', label: 'Baixa - Consulta de rotina', description: 'Sem dor ou desconforto' },
  { value: 'media', label: 'Média - Desconforto moderado', description: 'Algum incômodo, mas suportável' },
  { value: 'alta', label: 'Alta - Dor intensa', description: 'Dor forte que precisa de atenção urgente' }
]

export function SolicitarAtendimento() {
  const { addToQueue } = useQueueStore()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    especialidade: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    descricao: '',
    imagem: null as string | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagem: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error('Usuário não logado')
      return
    }

    setIsSubmitting(true)
    
    try {
      await addToQueue({
        pacienteId: user.id,
        pacienteNome: user.name,
        especialidade: formData.especialidade,
        descricao: formData.descricao,
        prioridade: formData.prioridade,
        imagem: formData.imagem || undefined
      })
      
      setIsSubmitting(false)
      setCurrentStep(4) // Sucesso
    } catch (error) {
      console.error('Erro ao adicionar à fila:', error)
      setIsSubmitting(false)
      // Manter no step atual para mostrar erro
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.especialidade && formData.prioridade
      case 2: return formData.descricao.trim().length > 10
      case 3: return true // Imagem é opcional
      default: return false
    }
  }

  const handleNavigateToQueue = () => {
    window.location.hash = '/paciente'
  }

  const handleNewRequest = () => {
    setCurrentStep(1)
    setFormData({
      especialidade: '',
      prioridade: 'media',
      descricao: '',
      imagem: null
    })
  }

  if (currentStep === 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-primaryDark mb-2">Solicitação Enviada!</h2>
            <p className="text-gray-600 mb-6">
              Sua consulta foi adicionada à fila. Você receberá uma notificação quando for sua vez.
            </p>
            <div className="space-y-4">
              <Button onClick={handleNavigateToQueue}>
                Ver Posição na Fila
              </Button>
              <Button variant="secondary" onClick={handleNewRequest}>
                Nova Solicitação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primaryDark">Solicitar Atendimento</h1>
        <p className="text-gray-600 mt-1">
          Preencha as informações abaixo para solicitar sua consulta
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step <= currentStep
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 rounded transition-colors ${
                step < currentStep ? 'bg-accent' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Especialidade e Prioridade'}
            {currentStep === 2 && 'Descreva seu caso'}
            {currentStep === 3 && 'Anexar imagem (opcional)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecione a especialidade
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {especialidades.map((esp) => (
                    <button
                      key={esp}
                      onClick={() => setFormData(prev => ({ ...prev, especialidade: esp }))}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        formData.especialidade === esp
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {esp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de prioridade
                </label>
                <div className="space-y-3">
                  {prioridades.map((prio) => (
                    <button
                      key={prio.value}
                      onClick={() => setFormData(prev => ({ ...prev, prioridade: prio.value as any }))}
                      className={`w-full p-4 text-left border rounded-lg transition-all ${
                        formData.prioridade === prio.value
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{prio.label}</div>
                      <div className="text-sm text-gray-500">{prio.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descreva detalhadamente seu problema
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={6}
                  placeholder="Ex: Estou sentindo dor no dente do lado direito, principalmente ao mastigar. A dor começou há 3 dias e tem piorado..."
                />
                <div className="text-sm text-gray-500 mt-1">
                  {formData.descricao.length}/500 caracteres (mínimo 10)
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-primaryDark mb-2">Dicas para uma boa descrição:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quando começou o problema?</li>
                  <li>• Intensidade da dor (1-10)</li>
                  <li>• O que piora ou melhora?</li>
                  <li>• Medicamentos já utilizados</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar foto (opcional)
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Uma imagem pode ajudar o dentista a fazer um diagnóstico mais preciso
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {formData.imagem ? (
                      <div>
                        <img 
                          src={formData.imagem} 
                          alt="Prévia" 
                          className="max-w-xs mx-auto mb-2 rounded"
                        />
                        <p className="text-sm text-accent">Clique para alterar a imagem</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Clique para selecionar uma imagem</p>
                        <p className="text-sm text-gray-400">PNG, JPG até 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Importante</h4>
                <p className="text-sm text-yellow-700">
                  Não compartilhe informações pessoais sensíveis ou documentos de identidade.
                  Apenas imagens relacionadas ao problema odontológico.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            {currentStep > 1 && (
              <Button 
                variant="secondary" 
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep < 3 ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}