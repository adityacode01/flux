import { ok, parseJson, requireUserId, withErrorHandling } from "@/lib/api";
import { getProfile, updateProfile } from "@/services/user.service";
import { updateProfileSchema } from "@/validations/user";

export const GET = withErrorHandling(async () => ok(await getProfile(await requireUserId())));

export const PATCH = withErrorHandling(async (req) => {
  const userId = await requireUserId();
  return ok(await updateProfile(userId, await parseJson(req, updateProfileSchema)));
});
