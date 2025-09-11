import { requireAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { withApiLogger } from '@/lib/middleware/api-logger';
import dbConnect from '@/lib/mongodb';
import { AssetModel } from '@/models';
import mongoose from 'mongoose';
import { type NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

interface UpdateAssetPayload {
  branchId?: string;
  name?: string;
  type?:
    | 'vehicle'
    | 'property'
    | 'equipment'
    | 'furniture'
    | 'technology'
    | 'musical';
  value?: number;
  purchaseDate?: Date;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
  status?:
    | 'active'
    | 'maintenance'
    | 'disposed'
    | 'sold'
    | 'donated'
    | 'lost'
    | 'stolen';
  serialNumber?: string;
  warranty?: string;
  supplier?: string;
  maintenanceSchedule?:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually';
  notes?: string;
}

// GET /api/assets/[id] - Get single asset by ID
async function getAssetByIdHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/assets/${id}` },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const user = authResult;
    if (!user.user?.churchId) {
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const asset = await AssetModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    }).populate('branchId', 'branchName location');
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    return NextResponse.json({ asset });
  } catch (error) {
    contextLogger.error('Unexpected error in getAssetByIdHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/assets/[id] - Update asset by ID
async function updateAssetHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/assets/${id}` },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const user = authResult;
    if (!user.user?.churchId) {
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    const updateData: UpdateAssetPayload = await request.json();
    // Check if asset exists and belongs to the user's church
    const existingAsset = await AssetModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    // Optional: Check for duplicate asset names in same branch if asset name is being updated
    if (updateData.name && updateData.name !== existingAsset.name) {
      const duplicateAsset = await AssetModel.findOne({
        churchId: user.user.churchId,
        branchId: updateData.branchId || existingAsset.branchId,
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }, // Exclude current asset
        status: { $nin: ['disposed', 'sold', 'donated', 'lost', 'stolen'] },
      });
      if (duplicateAsset) {
        contextLogger.warn('Duplicate asset name detected during update', {
          duplicateAssetId: duplicateAsset._id,
          assetName: updateData.name,
        });
        // Allow duplicates but log warning
      }
    }
    // Validate purchase date if provided
    if (
      updateData.purchaseDate &&
      new Date(updateData.purchaseDate) > new Date()
    ) {
      return NextResponse.json(
        { error: 'Purchase date cannot be in the future' },
        { status: 400 }
      );
    }
    // Update the asset
    const updatedAsset = await AssetModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate('branchId', 'branchName location');
    contextLogger.info('Asset updated successfully', {
      assetId: id,
      updatedFields: Object.keys(updateData),
    });
    return NextResponse.json({
      asset: updatedAsset,
      message: 'Asset updated successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in updateAssetHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/assets/[id] - Delete asset by ID
async function deleteAssetHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const contextLogger = logger.createContextLogger(
    { requestId, endpoint: `/api/church/assets/${id}` },
    'api'
  );
  try {
    // Check authentication and authorization
    const authResult = await requireAuth(['superadmin', 'admin'])(request);
    if (authResult instanceof Response) {
      const body = await authResult.text();
      return new NextResponse(body, {
        status: authResult.status,
        statusText: authResult.statusText,
        headers: authResult.headers,
      });
    }
    const user = authResult;
    if (!user.user?.churchId) {
      return NextResponse.json(
        { error: 'Church ID not found' },
        { status: 400 }
      );
    }
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid asset ID format' },
        { status: 400 }
      );
    }
    await dbConnect();
    // Check if asset exists and belongs to the user's church
    const existingAsset = await AssetModel.findOne({
      _id: id,
      churchId: user.user.churchId,
    });
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    // Get query parameter to determine if it's a hard delete or status change
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';
    const disposeAsset = searchParams.get('dispose') === 'true';
    if (forceDelete) {
      // Hard delete - permanently remove the asset
      await AssetModel.findByIdAndDelete(id);
      contextLogger.info('Asset permanently deleted', { assetId: id });
      return NextResponse.json({
        message: 'Asset permanently deleted successfully',
      });
    }
    if (disposeAsset) {
      // Dispose the asset instead of deleting
      const disposedAsset = await AssetModel.findByIdAndUpdate(
        id,
        {
          status: 'disposed',
          updatedAt: new Date(),
        },
        { new: true }
      ).populate('branchId', 'branchName location');
      contextLogger.info('Asset disposed', { assetId: id });
      return NextResponse.json({
        asset: disposedAsset,
        message: 'Asset disposed successfully',
      });
    }
    // Default: Hard delete (since assets don't have isActive field like branches)
    await AssetModel.findByIdAndDelete(id);
    contextLogger.info('Asset deleted', { assetId: id });
    return NextResponse.json({
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    contextLogger.error('Unexpected error in deleteAssetHandler', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers wrapped with logging middleware
export const GET = withApiLogger(getAssetByIdHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const PUT = withApiLogger(updateAssetHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});

export const DELETE = withApiLogger(deleteAssetHandler, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
});
