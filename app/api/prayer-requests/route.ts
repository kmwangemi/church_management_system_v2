// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import PrayerRequest from "@/models/PrayerRequest"
// import { verifyToken } from "@/lib/auth"

// export async function GET(request: NextRequest) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const { searchParams } = new URL(request.url)
//     const page = Number.parseInt(searchParams.get("page") || "1")
//     const limit = Number.parseInt(searchParams.get("limit") || "10")
//     const search = searchParams.get("search") || ""
//     const category = searchParams.get("category") || ""
//     const status = searchParams.get("status") || ""

//     const query: any = { churchId: user.churchId }

//     if (search) {
//       query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//     }

//     if (category) {
//       query.category = category
//     }

//     if (status) {
//       query.status = status
//     }

//     const skip = (page - 1) * limit

//     const [prayerRequests, total] = await Promise.all([
//       PrayerRequest.find(query)
//         .populate("requesterId", "firstName lastName")
//         .populate("assignedTo", "firstName lastName")
//         .populate("branchId", "name")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       PrayerRequest.countDocuments(query),
//     ])

//     return NextResponse.json({
//       prayerRequests,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get prayer requests error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const prayerData = await request.json()

//     const prayerRequest = new PrayerRequest({
//       ...prayerData,
//       churchId: user.churchId,
//     })

//     await prayerRequest.save()
//     await prayerRequest.populate(["requesterId", "assignedTo", "branchId"])

//     return NextResponse.json(prayerRequest, { status: 201 })
//   } catch (error) {
//     console.error("Create prayer request error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
