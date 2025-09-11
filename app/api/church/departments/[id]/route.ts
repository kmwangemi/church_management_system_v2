// import { type NextRequest, NextResponse } from "next/server"
// import dbConnect from "@/lib/mongodb"
// import Branch from "@/models/Branch"
// import Member from "@/models/Member"
// import Department from "@/models/Department"
// import { verifyToken } from "@/lib/auth"

// export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const [branch, memberCount, departments] = await Promise.all([
//       Branch.findOne({ _id: params.id, churchId: user.churchId }).populate(
//         "pastorId",
//         "firstName lastName email phone",
//       ),
//       Member.countDocuments({ branchId: params.id, churchId: user.churchId }),
//       Department.find({ branchId: params.id, churchId: user.churchId }).populate("headId", "firstName lastName"),
//     ])

//     if (!branch) {
//       return NextResponse.json({ error: "Branch not found" }, { status: 404 })
//     }

//     return NextResponse.json({
//       branch,
//       memberCount,
//       departments,
//     })
//   } catch (error) {
//     console.error("Get branch error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const user = await verifyToken(request)
//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     await dbConnect()

//     const updateData = await request.json()

//     const branch = await Branch.findOneAndUpdate({ _id: params.id, churchId: user.churchId }, updateData, {
//       new: true,
//     }).populate("pastorId", "firstName lastName")

//     if (!branch) {
//       return NextResponse.json({ error: "Branch not found" }, { status: 404 })
//     }

//     return NextResponse.json(branch)
//   } catch (error) {
//     console.error("Update branch error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }
