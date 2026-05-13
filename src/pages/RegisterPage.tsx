import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../features/auth/authContext";
import { getErrorMessage } from "../lib/errors";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ email, password });
      navigate("/products", { replace: true });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-md border border-ink-950/10 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-bold text-ink-950">Create account</h1>
      <p className="mt-2 text-sm leading-6 text-ink-600">Registration creates a customer user and immediately returns a JWT.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input label="Email" name="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Input
          label="Password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
        <Button className="w-full" isLoading={isSubmitting} type="submit">
          Register
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link className="font-semibold text-market-700 hover:text-market-600" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
