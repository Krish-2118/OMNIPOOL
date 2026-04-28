import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import useStore from "../store/useStore";
import { loginUser, googleLoginUser } from "../api/client";

const SignInPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from || "/dashboard";

  const extractErrorMessage = (err: any) => {
    const be = err?.response?.data?.error;
    if (typeof be === "string") return be;
    if (be?.message) return be.message;
    if (err?.code) return err.code;
    if (err?.message) return err.message;
    try {
      return JSON.stringify(be || err);
    } catch {
      return "An unexpected error occurred";
    }
  };

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { data } = await loginUser({ email: email.trim(), password });
      setUser(data.data);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        extractErrorMessage(err) ||
          "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const { data } = await googleLoginUser({
        email: user.email || "",
        name: user.displayName || user.email?.split("@")[0] || "User",
        avatar_url: user.photoURL || "",
      });

      setUser(data.data);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(extractErrorMessage(err) || "Failed to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md glass-card p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Home
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Sign in to OmniPool
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Welcome back! Please sign in to continue.
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full mb-4 px-4 py-2.5 border border-border-default rounded-xl text-sm font-medium text-text-primary hover:bg-bg-secondary transition-all disabled:opacity-70 flex items-center justify-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-4 h-4"
          />
          Continue with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-default" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-card px-2 text-text-muted">or</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 text-text-primary"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 pr-12 text-text-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-3 text-text-muted hover:text-text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-end">
            <a
              href="mailto:support@omnipool.local?subject=Password%20reset%20help"
              className="text-sm text-accent-indigo hover:underline"
            >
              Forgot password? Contact support
            </a>
          </div>

          {error && <p className="text-sm text-accent-rose">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 rounded-xl bg-accent-indigo text-white font-medium hover:bg-accent-violet transition-all disabled:opacity-70 flex justify-center"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-sm text-text-muted mt-6 text-center">
          New to OmniPool?{" "}
          <Link to="/signup" className="text-accent-indigo hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
