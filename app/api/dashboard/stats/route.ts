import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Member from "@/models/Member"
import Donation from "@/models/Donation"
import Event from "@/models/Event"
import Group from "@/models/Group"
import Branch from "@/models/Branch"
import PrayerRequest from "@/models/PrayerRequest"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [
      totalMembers,
      activeMembers,
      totalDonations,
      monthlyDonations,
      upcomingEvents,
      totalGroups,
      totalBranches,
      activePrayerRequests,
      recentMembers,
      donationsByCategory,
    ] = await Promise.all([
      Member.countDocuments({ churchId: user.churchId }),
      Member.countDocuments({ churchId: user.churchId, membershipStatus: "Active" }),
      Donation.aggregate([
        { $match: { churchId: user.churchId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Donation.aggregate([
        {
          $match: {
            churchId: user.churchId,
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Event.countDocuments({
        churchId: user.churchId,
        startDate: { $gte: new Date() },
        status: { $in: ["Planned", "Active"] },
      }),
      Group.countDocuments({ churchId: user.churchId, isActive: true }),
      Branch.countDocuments({ churchId: user.churchId, isActive: true }),
      PrayerRequest.countDocuments({
        churchId: user.churchId,
        status: { $in: ["Open", "In Progress"] },
      }),
      Member.find({ churchId: user.churchId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("firstName lastName membershipDate"),
      Donation.aggregate([
        { $match: { churchId: user.churchId } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalDonations: totalDonations[0]?.total || 0,
      monthlyDonations: monthlyDonations[0]?.total || 0,
      upcomingEvents,
      totalGroups,
      totalBranches,
      activePrayerRequests,
      recentMembers,
      donationsByCategory,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
