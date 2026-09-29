import { ok, parseJson, withErrorHandling } from "@/lib/api";
import { registerUser } from "@/services/auth.service";
import { registerSchema } from "@/validations/auth";

export const POST = withErrorHandling(async (req) => {
  const input = await parseJson(req, registerSchema);
  return ok(await registerUser(input), 201);
});
