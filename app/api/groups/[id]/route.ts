import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Group from "@/models/Group"
import Member from "@/models/Member"
import Attendance from "@/models/Attendance"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [group, members, attendanceStats] = await Promise.all([
      Group.findOne({ _id: params.id, churchId: user.churchId })
        .populate("leaderId", "firstName lastName email phone")
        .populate("branchId", "name address"),
      Member.find({
        groupIds: params.id,
        churchId: user.churchId,
      }).select("firstName lastName email phone membershipStatus"),
      Attendance.aggregate([
        {
          $match: {
            groupId: params.id,
            churchId: user.churchId,
            date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json({
      group,
      members,
      attendanceStats,
      memberCount: members.length,
    })
  } catch (error) {
    console.error("Get group error:", error)
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

    const group = await Group.findOneAndUpdate({ _id: params.id, churchId: user.churchId }, updateData, {
      new: true,
    }).populate(["leaderId", "branchId"])

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error("Update group error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
