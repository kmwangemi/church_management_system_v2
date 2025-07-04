import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Member from "@/models/Member"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const member = await Member.findOne({
      _id: params.id,
      churchId: user.churchId,
    })
      .populate("branchId", "name address")
      .populate("departmentIds", "name description")
      .populate("groupIds", "name category leaderId")

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Get member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const updateData = await request.json()

    const member = await Member.findOneAndUpdate({ _id: params.id, churchId: user.churchId }, updateData, {
      new: true,
    }).populate(["branchId", "departmentIds", "groupIds"])

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Update member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const member = await Member.findOneAndDelete({
      _id: params.id,
      churchId: user.churchId,
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Member deleted successfully" })
  } catch (error) {
    console.error("Delete member error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
