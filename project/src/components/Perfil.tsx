import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/auth'
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react'

export function Perfil() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Usuário não encontrado</p>
      </div>
    )
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      paciente: 'Paciente',
      dentista: 'Dentista',
      psicologo: 'Psicólogo',
      medico: 'Médico',
      admin: 'Administrador'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>

              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </p>
                </div>
              )}

              {user.birthDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(user.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuário
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {getRoleDisplayName(user.role)}
                </p>
              </div>

              {user.cro && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CRO/CRM
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{user.cro}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{getRoleDisplayName(user.role)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Ativo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Online:</span>
                <span className={user.isOnline ? "text-green-600" : "text-gray-400"}>
                  {user.isOnline ? "Sim" : "Não"}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
