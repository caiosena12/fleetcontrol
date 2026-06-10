import { LoginForm } from "./login-form"
import type { LoginState } from "./actions"

type LoginPageProps = {
  searchParams?: Promise<{
    reason?: string
  }>
}

const initialLoginState: LoginState = {
  error: null,
  email: "",
}

function getInitialState(reason?: string): LoginState {
  if (reason === "session") {
    return {
      email: "",
      error:
        "Sua sessao nao foi encontrada. Entre novamente para acessar o dashboard.",
    }
  }

  return initialLoginState
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : undefined

  return <LoginForm initialState={getInitialState(params?.reason)} />
}
