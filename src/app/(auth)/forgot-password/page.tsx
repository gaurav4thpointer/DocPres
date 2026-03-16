import Link from "next/link";
import { Stethoscope, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-sky-600 shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DocPres</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Reset your password</h2>
          <p className="text-sm text-gray-500 mb-6">
            Password reset via email is not available in this version. Contact your system administrator to reset the doctor account password.
          </p>

          <FormField label="Email address" htmlFor="email">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="doctor@clinic.com"
                className="pl-9"
                disabled
              />
            </div>
          </FormField>

          <Button className="w-full mt-4" disabled>
            Send Reset Link (Coming Soon)
          </Button>

          <div className="mt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700">
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
