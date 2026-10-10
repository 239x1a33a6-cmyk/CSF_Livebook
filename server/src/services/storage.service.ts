import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        // Safe filename generation using timestamp + original name, stripping spaces
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '');
        cb(null, `${uniqueSuffix}-${safeName}`);
    }
});

// Create upload instance
export const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    },
    fileFilter: (req, file, cb) => {
        // Allowed formats for our simple platform
        const allowedMimeTypes = ['video/mp4', 'video/webm', 'application/pdf', 'text/markdown'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError('BAD_REQUEST', `Unsupported file type: ${file.mimetype}. Allowed: MP4, WEBM, PDF, MD`, 400));
        }
    }
});

export const storageService = {
    async handleUpload(file: Express.Multer.File): Promise<string> {
        // Retrieve file from disk safely, encode as Data URI, then destroy local file to protect ephemeral storage
        const buffer = fs.readFileSync(file.path);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64}`;

        // Clean up from the uploads folder to save ephemeral disk space
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Return the Data URI to be mapped natively into Postgres
        return dataUri;
    },

    async deleteFile(filePath: string): Promise<void> {
        // No longer serving from /uploads/, files reside natively in DB as base64
        // Deletion at DB layer automatically resolves storage overhead.
        return;
    }
};
