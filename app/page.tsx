"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
export default function AuthPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Vérifie ta boîte mail pour confirmer ton inscription !");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setMessage(error.message);
      else router.push("/dashboard");
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-sm w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {isSignUp ? "Créer un compte" : "Connexion"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-semibold"
          >
            {isSignUp ? "S'inscrire" : "Se connecter"}
          </button>
        </form>
        {message && <p className="text-sm text-red-500 mt-3">{message}</p>}
        <p
          className="text-sm text-center mt-4 cursor-pointer text-blue-600"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Vous avez déjà un compte ? Connectez‑vous"
            : "Créer un compte"}
        </p>
      </div>
    </div>
  );
}