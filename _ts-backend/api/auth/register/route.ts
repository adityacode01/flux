import { ok, parseJson, withErrorHandling } from "@/lib/api";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validations/auth";

export const POST = withErrorHandling(async (req) => {
  const input = await parseJson(req, registerSchema);
  const user = await registerUser(input);
  return ok(user, 201);
});
