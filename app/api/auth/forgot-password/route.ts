import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    const { email } = await request.json()
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists, a reset link has been sent." })
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()
    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    return NextResponse.json({
      message: "Password reset link sent to your email",
      resetToken, // Remove this in production
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
