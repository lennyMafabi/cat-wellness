import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { type MediaAsset } from '@/types/media';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DB_PATH = path.join(process.cwd(), 'data', 'media.json');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Read media database
async function readMediaDB(): Promise<MediaAsset[]> {
  try {
    await ensureDirectories();
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write media database
async function writeMediaDB(assets: MediaAsset[]) {
  await ensureDirectories();
  await fs.writeFile(DB_PATH, JSON.stringify(assets, null, 2));
}

// GET - List all media assets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    let assets = await readMediaDB();
    
    if (section) {
      assets = assets.filter(a => a.section === section);
    }
    
    // Sort by order and creation date
    assets.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json({ 
      success: true, 
      assets,
      total: assets.length 
    });
  } catch (error) {
    console.error('Error reading media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read media assets' },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const section = formData.get('section') as MediaAsset['section'];
    const alt = formData.get('alt') as string || '';
    const caption = formData.get('caption') as string || '';
    
    if (!file || !section) {
      return NextResponse.json(
        { success: false, error: 'File and section are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    await ensureDirectories();

    // Generate unique filename
    const id = uuidv4();
    const ext = path.extname(file.name);
    const filename = `${id}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(bytes));

    // Create asset record
    const assets = await readMediaDB();
    const maxOrder = Math.max(0, ...assets.map(a => a.order));
    
    const newAsset: MediaAsset = {
      id,
      filename,
      originalName: file.name,
      url: `/uploads/${filename}`,
      mimeType: file.type,
      size: file.size,
      section,
      alt,
      caption,
      order: maxOrder + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    assets.push(newAsset);
    await writeMediaDB(assets);

    return NextResponse.json({ 
      success: true, 
      asset: newAsset 
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}

// PUT - Update media asset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'ID and updates are required' },
        { status: 400 }
      );
    }

    const assets = await readMediaDB();
    const index = assets.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    assets[index] = {
      ...assets[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await writeMediaDB(assets);

    return NextResponse.json({ 
      success: true, 
      asset: assets[index] 
    });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const assets = await readMediaDB();
    const asset = assets.find(a => a.id === id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete file
    const filepath = path.join(UPLOAD_DIR, asset.filename);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Remove from database
    const updatedAssets = assets.filter(a => a.id !== id);
    await writeMediaDB(updatedAssets);

    return NextResponse.json({ 
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
