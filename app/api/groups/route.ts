// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Group from "@/models/Group"
// import Member from "@/models/Member"
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

//     const query: any = { churchId: user.churchId }

//     if (search) {
//       query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
//     }

//     if (category) {
//       query.category = category
//     }

//     const skip = (page - 1) * limit

//     const [groups, total] = await Promise.all([
//       Group.find(query)
//         .populate("leaderId", "firstName lastName")
//         .populate("branchId", "name")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Group.countDocuments(query),
//     ])

//     // Get member counts for each group
//     const groupsWithCounts = await Promise.all(
//       groups.map(async (group) => {
//         const memberCount = await Member.countDocuments({
//           groupIds: group._id,
//           churchId: user.churchId,
//         })
//         return {
//           ...group.toObject(),
//           memberCount,
//         }
//       }),
//     )

//     return NextResponse.json({
//       groups: groupsWithCounts,
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error("Get groups error:", error)
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

//     const groupData = await request.json()

//     const group = new Group({
//       ...groupData,
//       churchId: user.churchId,
//     })

//     await group.save()
//     await group.populate(["leaderId", "branchId"])

//     return NextResponse.json(group, { status: 201 })
//   } catch (error) {
//     console.error("Create group error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
