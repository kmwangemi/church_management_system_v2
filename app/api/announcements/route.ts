// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Announcement from "@/models/Announcement"
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
//       query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
//     }

//     if (category) {
//       query.category = category
//     }

//     if (status) {
//       query.status = status
//     }

//     const skip = (page - 1) * limit

//     const [announcements, total] = await Promise.all([
//       Announcement.find(query)
//         .populate("authorId", "firstName lastName")
//         .populate("branchId", "name")
//         .sort({ isPinned: -1, publishDate: -1 })
//         .skip(skip)
//         .limit(limit),
//       Announcement.countDocuments(query),
//     ])

//     return NextResponse.json({
//       announcements,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get announcements error:", error)
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

//     const announcementData = await request.json()

//     const announcement = new Announcement({
//       ...announcementData,
//       churchId: user.churchId,
//       authorId: user.userId,
//     })

//     await announcement.save()
//     await announcement.populate(["authorId", "branchId"])

//     return NextResponse.json(announcement, { status: 201 })
//   } catch (error) {
//     console.error("Create announcement error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
