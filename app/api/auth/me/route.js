// src/app/api/auth/me/route.js
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }
    
    // Return user info (exclude sensitive data)
    return Response.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return Response.json(
      { error: "Failed to get user info" },
      { status: 500 }
    );
  }
}
