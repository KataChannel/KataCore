// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/app/lib/lib/auth";

export const { GET, POST } = handlers;