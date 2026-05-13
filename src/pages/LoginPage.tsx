import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../features/auth/authContext";
import { getErrorMessage } from "../lib/errors";

type LocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("buyer@example.com");
  const [password, setPassword] = useState("very-secret-password");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const state = location.state as LocationState | null;
      navigate(state?.from?.pathname || "/products", { replace: true });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
      <section>
        <p className="text-xs font-bold uppercase tracking-wide text-market-700">JWT authentication</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-950">Sign in to manage inventory and cart state.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-600">
          The Go API issues a short-lived bearer token on login. This frontend stores it locally, attaches it through the
          reusable API client, and clears cached protected data on sign out.
        </p>
      </section>

      <form className="rounded-md border border-ink-950/10 bg-white p-6 shadow-soft" onSubmit={onSubmit}>
        <div className="space-y-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input label="Email" name="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <Input
            label="Password"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <Button className="w-full" isLoading={isSubmitting} type="submit">
            Sign in
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-ink-600">
          New here?{" "}
          <Link className="font-semibold text-market-700 hover:text-market-600" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
