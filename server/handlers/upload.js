/**
 * File Upload Handlers
 * AWS S3 file upload functionality for agreements
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import connectDB from '../lib/db.js';
import User from '../models/User.js';
import crypto from 'crypto';

// Initialize S3 client configuration
const s3ClientConfig = {
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  },
};

// Add session token if using temporary credentials (IAM role or STS)
// if (process.env.VITE_AWS_SESSION_TOKEN) {
//   s3ClientConfig.credentials.sessionToken = process.env.VITE_AWS_SESSION_TOKEN;
// }

const s3Client = new S3Client(s3ClientConfig);

const S3_BUCKET = process.env.VITE_AWS_S3_BUCKET || 'wildthings-staging-documents';

/**
 * POST /api/upload/agreement
 * Upload agreement file to S3
 * Admin only
 */
export async function handleUploadAgreement(req, res) {
  try {
    await connectDB();

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const { verifyToken } = await import('../lib/jwt.js');
    const decoded = verifyToken(token);

    // Get current user to check if admin
    const currentUser = await User.findById(decoded.id);
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is admin
    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.',
      });
    }

    // Check if file is provided
    if (!req.file && !req.body.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Get file data (supports both multipart and base64)
    let fileBuffer;
    let fileName;
    let fileType;
    let fileSize;

    if (req.file) {
      // Multipart upload
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    } else if (req.body.file) {
      // Base64 upload
      const base64Data = req.body.file.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
      fileName = req.body.fileName || 'document.pdf';
      fileType = req.body.fileType || 'application/pdf';
      fileSize = fileBuffer.length;
    }

    // Validate file type (PDF, DOCX, DOC, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'image/jpeg',
      'image/png',
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Allowed: PDF, DOCX, DOC, XLS, XLSX, JPEG, PNG',
      });
    }

    // Validate file size (max 3MB for Vercel compatibility)
    // Vercel has a 4.5MB request body limit, and base64 encoding increases size by ~33%
    const maxSize = 3 * 1024 * 1024; // 3MB
    if (fileSize > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 3MB',
      });
    }

    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `agreements/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;

    // Upload to S3 with public read access
    const uploadParams = {
      Bucket: S3_BUCKET,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: fileType,
      ServerSideEncryption: 'AES256',
      ACL: 'public-read', // Make file publicly readable
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate S3 URL
    const s3Url = `https://${S3_BUCKET}.s3.${process.env.VITE_AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${uniqueFileName}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: s3Url,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
    });
  } catch (error) {
    console.error('❌ Upload agreement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file',
    });
  }
}

/**
 * Helper function to parse multipart form data
 * This is a simple implementation - in production, use a library like 'busboy' or 'formidable'
 */
export function parseMultipartFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        
        if (!boundary) {
          return reject(new Error('No boundary found in content-type'));
        }
        
        // Simple parsing - in production, use a proper library
        const parts = buffer.toString('binary').split(`--${boundary}`);
        
        for (const part of parts) {
          if (part.includes('Content-Disposition: form-data')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            const filenameMatch = part.match(/filename="([^"]+)"/);
            
            if (filenameMatch) {
              const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
              const dataStart = part.indexOf('\r\n\r\n') + 4;
              const dataEnd = part.lastIndexOf('\r\n');
              const fileData = part.substring(dataStart, dataEnd);
              
              resolve({
                file: {
                  buffer: Buffer.from(fileData, 'binary'),
                  originalname: filenameMatch[1],
                  mimetype: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream',
                  size: fileData.length,
                },
              });
              return;
            }
          }
        }
        
        reject(new Error('No file found in multipart data'));
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
}

