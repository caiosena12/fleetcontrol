"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Truck } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      console.log("Attempting login with email:", email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Login response:", { data, error })

      if (error) {
        // Tratar diferentes tipos de erro do Supabase
        console.error("Login error details:", error)
        
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid")) {
          setError("Email ou senha incorretos. Tente novamente.")
        } else if (error.message.includes("Email not confirmed") || error.message.includes("confirm")) {
          setError("Por favor, confirme seu email antes de fazer login.")
        } else if (error.message.includes("Too many requests") || error.message.includes("rate")) {
          setError("Muitas tentativas. Aguarde alguns minutos.")
        } else if (error.message.includes("Failed to fetch") || error.message.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else {
          setError(`Erro ao fazer login: ${error.message}`)
        }
        setLoading(false)
        return
      }

      // Login bem-sucedido
      console.log("Login successful, redirecting...")
      router.push("/dashboard")
    } catch (err: unknown) {
      // Erro de rede ou conexão
      console.error("Login catch error:", err)
      
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("network")) {
        setError("Erro de conexão. Verifique sua internet e tente novamente.")
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">FleetControl</CardTitle>
          <CardDescription>
            Entre com sua conta para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Spinner className="mr-2" /> : null}
                Entrar
              </Button>
            </FieldGroup>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Nao tem uma conta?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
