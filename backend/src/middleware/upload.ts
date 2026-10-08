import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Destination directory for uploads
const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'resumes')

// Ensure directory exists synchronously at startup
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDirectory)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const userId = req.user?.userId || 'unknown'
    const timestamp = Date.now()
    // Sanitize original filename (keep only alphanumeric and extension)
    const ext = path.extname(file.originalname).toLowerCase()
    const cleanBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 40)

    cb(null, `resume_${userId}_${timestamp}_${cleanBasename}${ext}`)
  }
})

// File filter: accept only PDF and standard Word documents
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const allowedExtensions = ['.pdf', '.doc', '.docx']
  const fileExt = path.extname(file.originalname).toLowerCase()

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true)
  } else {
    const error: any = new Error(
      'Invalid file format. Only PDF, DOC, and DOCX files up to 5MB are allowed.'
    )
    error.statusCode = 400
    error.code = 'INVALID_FILE_TYPE'
    cb(error)
  }
}

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max limit
  }
})
