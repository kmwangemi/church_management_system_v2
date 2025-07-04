import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Member from "@/models/Member"
import Donation from "@/models/Donation"
import Attendance from "@/models/Attendance"
import Event from "@/models/Event"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "overview"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter =
      startDate && endDate
        ? {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          }
        : {}

    let reportData = {}

    switch (reportType) {
      case "membership":
        reportData = await generateMembershipReport(user.churchId, dateFilter)
        break
      case "financial":
        reportData = await generateFinancialReport(user.churchId, dateFilter)
        break
      case "attendance":
        reportData = await generateAttendanceReport(user.churchId, dateFilter)
        break
      case "events":
        reportData = await generateEventsReport(user.churchId, dateFilter)
        break
      default:
        reportData = await generateOverviewReport(user.churchId)
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateMembershipReport(churchId: string, dateFilter: any) {
  const [totalMembers, membersByStatus, membersByGender, membersByAge, newMembers] = await Promise.all([
    Member.countDocuments({ churchId }),
    Member.aggregate([{ $match: { churchId } }, { $group: { _id: "$membershipStatus", count: { $sum: 1 } } }]),
    Member.aggregate([{ $match: { churchId } }, { $group: { _id: "$gender", count: { $sum: 1 } } }]),
    Member.aggregate([
      { $match: { churchId, dateOfBirth: { $exists: true } } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [{ $subtract: [new Date(), "$dateOfBirth"] }, 365.25 * 24 * 60 * 60 * 1000],
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 50, 65, 100],
          default: "Unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    dateFilter.$gte
      ? Member.countDocuments({
          churchId,
          membershipDate: dateFilter,
        })
      : Member.countDocuments({
          churchId,
          membershipDate: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),
  ])

  return {
    totalMembers,
    membersByStatus,
    membersByGender,
    membersByAge,
    newMembers,
  }
}

async function generateFinancialReport(churchId: string, dateFilter: any) {
  const matchFilter = { churchId, ...(dateFilter.$gte && { date: dateFilter }) }

  const [totalDonations, donationsByCategory, donationsByMonth, topDonors] = await Promise.all([
    Donation.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Donation.aggregate([
      { $match: { ...matchFilter, donorId: { $exists: true } } },
      { $group: { _id: "$donorId", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      { $lookup: { from: "members", localField: "_id", foreignField: "_id", as: "donor" } },
    ]),
  ])

  return {
    totalDonations: totalDonations[0] || { total: 0, count: 0 },
    donationsByCategory,
    donationsByMonth,
    topDonors,
  }
}

async function generateAttendanceReport(churchId: string, dateFilter: any) {
  const matchFilter = { churchId, ...(dateFilter.$gte && { date: dateFilter }) }

  const [totalAttendance, attendanceByService, attendanceTrends] = await Promise.all([
    Attendance.aggregate([{ $match: matchFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Attendance.aggregate([{ $match: matchFilter }, { $group: { _id: "$serviceType", count: { $sum: 1 } } }]),
    Attendance.aggregate([
      { $match: matchFilter },
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

  return {
    totalAttendance,
    attendanceByService,
    attendanceTrends,
  }
}

async function generateEventsReport(churchId: string, dateFilter: any) {
  const matchFilter = { churchId, ...(dateFilter.$gte && { startDate: dateFilter }) }

  const [totalEvents, eventsByCategory, eventsByStatus] = await Promise.all([
    Event.countDocuments(matchFilter),
    Event.aggregate([{ $match: matchFilter }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    Event.aggregate([{ $match: matchFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ])

  return {
    totalEvents,
    eventsByCategory,
    eventsByStatus,
  }
}

async function generateOverviewReport(churchId: string) {
  const [membership, financial, events] = await Promise.all([
    generateMembershipReport(churchId, {}),
    generateFinancialReport(churchId, {}),
    generateEventsReport(churchId, {}),
  ])

  return {
    membership,
    financial,
    events,
  }
}
