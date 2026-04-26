import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KeyRound, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const recuperarSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
});

type RecuperarForm = z.infer<typeof recuperarSchema>;

export default function RecuperarPassword() {
  const [enviado, setEnviado] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RecuperarForm>({
    resolver: zodResolver(recuperarSchema),
  });

  const onSubmit = async (data: RecuperarForm) => {
    // Simular envío de email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Email de recuperación enviado');
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Email Enviado</h2>
            <p className="text-gray-500 mb-4">
              Revisa tu bandeja de entrada y sigue las instrucciones para recuperar tu contraseña.
            </p>
            <Link to="/login" className="text-primary-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <KeyRound size={48} className="mx-auto text-primary-600 mb-2" />
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="tu@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full">
              Enviar Instrucciones
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}