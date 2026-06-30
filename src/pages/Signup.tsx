import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "supervisor">("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // useAuth removed since we no longer redirect

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (_, variables) => {
      navigate(`/${variables.role}/dashboard`);
    },
    onError: (err) => {
      setError(err.message || "Signup failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    signupMutation.mutate({ name, email, password, role });
  };

  // User can manually sign up even if they have an active session.

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              SuperMatch
            </h1>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as "student" | "supervisor")}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                size="lg"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
            <div className="pt-2 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-slate-400 text-center mt-6">
          CGPA-Based Ranking &bull; Transparent Allocation &bull; Efficient
          Matching
        </p>
      </div>
    </div>
  );
}

