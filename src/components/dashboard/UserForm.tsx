"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createProtectedUser } from "@/services/users";

const formSchema = z.object({
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
  role_id: z.string().min(1, "El rol es requerido."),
});

const roles = [
    { label: "Administrador", value: "1" },
    { label: "Master", value: "2" },
    { label: "Representante", value: "3" },
    { label: "Alumno", value: "4" },
]

export default function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role_id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        toast({
            variant: "destructive",
            title: "Error de Autenticación",
            description: "No se encontró el token de administrador. Por favor, inicia sesión de nuevo.",
        });
        setIsLoading(false);
        return;
    }

    try {
        const dataToSubmit = {
            email: values.email,
            password: values.password,
            roles_id: parseInt(values.role_id, 10),
        };

        const response = await createProtectedUser(dataToSubmit, token);

        toast({
            title: "¡Usuario Creado!",
            description: response.description || `El usuario ${values.email} ha sido registrado con éxito.`,
        });
        onSuccess();
        form.reset();

    } catch (error) {
        console.error("Error al crear usuario:", error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : "Error desconocido al intentar crear el usuario.";

        toast({
            variant: "destructive",
            title: "Error al Crear Usuario",
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const togglePasswordVisibility = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-auto pr-4">
          <div className="space-y-8 p-1">
            {/* Credentials Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Credenciales de Acceso</h3>
              <Separator />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@email.com"
                        {...field}
                        data-invalid={!!form.formState.errors.email}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          data-invalid={!!form.formState.errors.password}
                          disabled={isLoading}
                        />
                        <span
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-muted-foreground"
                            onMouseDown={togglePasswordVisibility}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl>
                            <SelectTrigger data-invalid={!!form.formState.errors.role_id}>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value} className="capitalize">
                                {role.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          </div>
        </ScrollArea>
        <Button type="submit" className="w-full mt-6" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </form>
    </Form>
  );
}
