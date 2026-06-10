"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export type LoginState = {
  error: string | null
  email: string
}

function getLoginErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid")
  ) {
    return "Email ou senha incorretos. Confira os dados e tente novamente."
  }

  if (
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("confirm")
  ) {
    return "Seu email ainda nao foi confirmado. Confirme o cadastro antes de entrar."
  }

  if (
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("rate")
  ) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  }

  return `Erro ao fazer login: ${message}`
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return {
      email,
      error: "Preencha email e senha para entrar.",
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      email,
      error: getLoginErrorMessage(error.message),
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      email,
      error:
        "Login aceito, mas a sessao nao foi criada no servidor. Tente novamente.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
