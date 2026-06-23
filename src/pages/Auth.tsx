import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function Auth() {
  const { session, signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  if (session) return <Navigate to="/" replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast.error("No pudimos iniciar sesión", { description: error.message });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("La contraseña debe tener al menos 8 caracteres");
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) toast.error("No pudimos crear la cuenta", { description: error.message });
    else toast.success("Cuenta creada. Iniciando sesión...");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex flex-1 gradient-navy text-navy-foreground p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary/20 grid place-content-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl">RevenueOS Control Tower</span>
        </div>
        <div className="space-y-6 max-w-md">
          <h1 className="font-display text-4xl leading-tight">
            Construye tu Revenue OS sin parálisis por análisis.
          </h1>
          <p className="text-navy-foreground/70">
            Un solo siguiente paso recomendado, progreso real por componente, dependencias claras y la
            evidencia exacta para declarar cada milestone como terminado.
          </p>
          <p className="text-xs text-navy-foreground/50 italic">
            Workspace privado de ejecución. No almacenes datos de pacientes ni información clínica.
          </p>
        </div>
        <div className="text-xs text-navy-foreground/40">8 semanas · 4 fases · 9 workstreams</div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg gradient-navy grid place-content-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-lg">RevenueOS Control Tower</span>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 surface-elevated p-8">
                <div>
                  <h2 className="font-display text-2xl">Bienvenido de vuelta</h2>
                  <p className="text-sm text-muted-foreground mt-1">Accede a tu Control Tower.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd">Contraseña</Label>
                  <Input id="pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 surface-elevated p-8">
                <div>
                  <h2 className="font-display text-2xl">Crea tu workspace</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    El primer usuario es Owner y configura el espacio.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Correo</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pwd2">Contraseña</Label>
                  <Input id="pwd2" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando..." : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
