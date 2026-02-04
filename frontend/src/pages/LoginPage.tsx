import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import LoginCard from "../components/LoginCard";

const mapAuthError = (message: string): string => {
  if (message.includes("auth/invalid-credential")) {
    return "Invalid email or password.";
  }
  if (message.includes("auth/user-not-found")) {
    return "No user found with that email.";
  }
  if (message.includes("auth/wrong-password")) {
    return "Incorrect password.";
  }
  if (message.includes("auth/too-many-requests")) {
    return "Too many attempts. Try again later.";
  }
  return message;
};

function LoginPage() {
  const { signIn, token, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && token) {
      navigate("/", { replace: true });
    }
  }, [loading, token, navigate]);

  const onLogin = async (): Promise<void> => {
    setStatus("loading");
    setMessage(null);
    try {
      await signIn(email, password);
      setStatus("success");
      setMessage("Signed in successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      setStatus("error");
      setMessage(mapAuthError((err as Error).message));
    }
  };

  return (
    <div className="min-h-screen bg-mist px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h1 className="text-4xl font-semibold">Admin Console</h1>
          <p className="mt-3 text-sm text-slate-500">
            Secure access to session controls. Sign in with your admin credentials.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full bg-white px-3 py-1">Firebase Auth</span>
            <span className="rounded-full bg-white px-3 py-1">Single Admin</span>
          </div>
        </div>
        <LoginCard
          email={email}
          password={password}
          status={status}
          message={message}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={() => void onLogin()}
        />
      </div>
    </div>
  );
}

export default LoginPage;
