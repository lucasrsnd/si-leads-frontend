"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Building2,
  Mail,
  Lock,
  Loader2,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { authApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

const stats = [
  { icon: Users, label: "Leads gerenciados", value: "2.4k+" },
  { icon: TrendingUp, label: "Taxa de conversão", value: "34%" },
  { icon: CheckCircle, label: "Negócios fechados", value: "891" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      setAuth(data.user, data.access_token);
      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${80 + i * 60}px`,
                height: `${80 + i * 60}px`,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                top: `${10 + i * 14}%`,
                left: `${-5 + i * 18}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative animate-slide-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">
              SI Imobiliárias
            </span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4 animate-slide-left stagger-1">
            Gerencie seus leads
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #818cf8, #c084fc)",
              }}
            >
              com inteligência
            </span>
          </h2>
          <p className="text-slate-400 text-base mb-10 animate-slide-left stagger-2">
            Do primeiro contato ao fechamento, tudo em um único lugar.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className={`glass rounded-2xl p-4 animate-fade-up stagger-${i + 3}`}
              >
                <Icon className="w-5 h-5 mb-2" style={{ color: "#818cf8" }} />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-600 text-sm animate-slide-left stagger-3">
          © 2026 SI Soluções Imobiliárias
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg)]">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text)]">
              SI Imobiliárias
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text)] mb-1">
            Entrar na plataforma
          </h1>
          <p className="text-[var(--text-muted)] text-sm mb-8">
            Bem-vindo de volta!
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-xl text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-[var(--border)] rounded-xl text-sm bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] mt-2"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-500 hover:text-indigo-400 transition"
            >
              Cadastre-se grátis
            </Link>
          </p>

          <div className="mt-6 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">
              Credenciais de demo
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              admin@si.com.br / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
