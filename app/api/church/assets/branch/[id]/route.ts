import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { AssetModel, BranchModel } from '@/models';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

async function getBranchAssetsHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/branches/${id}/assets` },
    'api'
  );

  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      // If authResult is a Response object, it means authentication/authorization failed
      // Convert Response to NextResponse
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }

    // authResult is now the authenticated user
    const user = authResult;
    if (!user.user?.churchId) {
      // Validate user has churchId
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Extract branchId from route parameters
    const branchId = id;
    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    // Verify the branch exists and belongs to the user's church
    const branch = await BranchModel.findOne({
      _id: branchId,
      churchId: user.user.churchId,
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found or access denied' },
        { status: 404 }
      );
    }

    // Get pagination and filter parameters from query string
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type'); // 'vehicle', 'property', 'equipment', etc.
    const status = searchParams.get('status'); // 'active', 'maintenance', 'disposed', etc.
    const condition = searchParams.get('condition'); // 'excellent', 'good', 'fair', 'poor'

    // Build base query for assets
    const query: any = {
      branchId,
      churchId: user.user.churchId, // Extra security check
    };

    // Add type filter if provided
    if (type) {
      const validTypes = [
        'vehicle',
        'property',
        'equipment',
        'furniture',
        'technology',
        'musical',
      ];
      if (validTypes.includes(type)) {
        query.type = type;
      } else {
        return NextResponse.json(
          {
            error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Add status filter if provided
    if (status) {
      const validStatuses = [
        'active',
        'maintenance',
        'disposed',
        'sold',
        'donated',
        'lost',
        'stolen',
      ];
      if (validStatuses.includes(status)) {
        query.status = status;
      } else {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Add condition filter if provided
    if (condition) {
      const validConditions = ['excellent', 'good', 'fair', 'poor'];
      if (validConditions.includes(condition)) {
        query.condition = condition;
      } else {
        return NextResponse.json(
          {
            error: `Invalid condition. Must be one of: ${validConditions.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Handle search - search across asset fields
    if (search && search.length > 0) {
      // Option 1: Use text search (recommended if you have text index on Asset model)
      query.$text = { $search: search };

      // Option 2: Alternative regex-based search for specific fields
      // Uncomment this if you prefer regex search or don't have text index
      /*
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
      */
    }

    const skip = (page - 1) * limit;

    // Build the find query
    let findQuery = AssetModel.find(query);

    // If using text search, sort by text score for relevance
    if (search && query.$text) {
      findQuery = findQuery.sort({
        score: { $meta: 'textScore' },
        createdAt: -1,
      });
    } else {
      findQuery = findQuery.sort({ createdAt: -1 });
    }

    const [assets, total] = await Promise.all([
      findQuery
        .populate('branchId', 'branchName location') // Populate branch info
        .skip(skip)
        .limit(limit),
      AssetModel.countDocuments(query),
    ]);

    // Calculate summary statistics
    const summaryQuery = { ...query };
    delete summaryQuery.$text; // Remove text search for summary calculation

    const [totalValue, statusCounts, typeCounts, conditionCounts] =
      await Promise.all([
        // Calculate total value of assets
        AssetModel.aggregate([
          { $match: summaryQuery },
          { $group: { _id: null, totalValue: { $sum: '$value' } } },
        ]),
        // Count by status
        AssetModel.aggregate([
          { $match: summaryQuery },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        // Count by type
        AssetModel.aggregate([
          { $match: summaryQuery },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        // Count by condition
        AssetModel.aggregate([
          { $match: summaryQuery },
          { $group: { _id: '$condition', count: { $sum: 1 } } },
        ]),
      ]);

    // Build response
    const response: any = {
      assets,
      branch: {
        id: branch._id,
        name: branch.branchName,
        description: branch.description,
        location: branch.location,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      summary: {
        totalValue: totalValue[0]?.totalValue || 0,
        totalAssets: total,
        statusBreakdown: statusCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        typeBreakdown: typeCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        conditionBreakdown: conditionCounts.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    };

    // Add search metadata if search was performed
    if (search) {
      response.searchTerm = search;
      response.searchResults = total;
    }

    // Add filter metadata if filters were applied
    if (type) response.typeFilter = type;
    if (status) response.statusFilter = status;
    if (condition) response.conditionFilter = condition;

    contextLogger.info(
      `Retrieved ${assets.length} assets for branch ${branchId}${
        type ? ` with type: ${type}` : ''
      }${status ? ` with status: ${status}` : ''}${
        condition ? ` with condition: ${condition}` : ''
      }`
    );

    return NextResponse.json(response);
  } catch (error) {
    contextLogger.error('Unexpected error in getBranchAssetsHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with logging middleware
export const GET = withApiLogger(getBranchAssetsHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
