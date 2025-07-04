import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Donation from "@/models/Donation"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category") || ""
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const query: any = { churchId: user.churchId }

    if (category) {
      query.category = category
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const skip = (page - 1) * limit

    const [donations, total, stats] = await Promise.all([
      Donation.find(query)
        .populate("donorId", "firstName lastName")
        .populate("branchId", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(query),
      Donation.aggregate([
        { $match: { churchId: user.churchId } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalDonations: { $sum: 1 },
            avgDonation: { $avg: "$amount" },
          },
        },
      ]),
    ])

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || { totalAmount: 0, totalDonations: 0, avgDonation: 0 },
    })
  } catch (error) {
    console.error("Get donations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const donationData = await request.json()

    const donation = new Donation({
      ...donationData,
      churchId: user.churchId,
    })

    await donation.save()
    await donation.populate(["donorId", "branchId"])

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error("Create donation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
