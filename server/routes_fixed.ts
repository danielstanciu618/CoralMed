import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertAppointmentSchema, insertMedicalRecordSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common medical file formats
    const allowedTypes = /jpeg|jpg|png|pdf|dcm|dicom/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tip de fișier neacceptat. Folosește: JPG, PNG, PDF, DICOM'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { password } = req.body;
      
      // Simple password check for demo - in production use proper user authentication
      if (password === "admin123") {
        res.json({ success: true, message: "Logged in successfully" });
      } else {
        res.status(401).json({ success: false, message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  // Patients
  app.get("/api/patients", async (req, res) => {
    try {
      const search = req.query.search as string;
      const patients = await storage.getPatients(search);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      console.log("Create patient data:", req.body);
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.json(patient);
    } catch (error: any) {
      console.error("Patient creation error:", error);
      res.status(400).json({ message: "Invalid patient data", error: error.message });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Update patient data:", req.body);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      res.json(patient);
    } catch (error: any) {
      console.error("Patient update error:", error);
      res.status(400).json({ message: "Invalid patient data", error: error.message });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePatient(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const appointments = await storage.getAppointments(date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/upcoming", async (req, res) => {
    try {
      const appointments = await storage.getUpcomingAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming appointments" });
    }
  });

  app.get("/api/appointments/month/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const appointments = await storage.getAppointmentsByMonth(year, month);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments for month" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      console.log("Create appointment data:", req.body);
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error: any) {
      console.error("Appointment creation error:", error);
      res.status(400).json({ message: "Invalid appointment data", error: error.message });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Update appointment data:", req.body);
      const validatedData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, validatedData);
      res.json(appointment);
    } catch (error: any) {
      console.error("Appointment update error:", error);
      res.status(400).json({ message: "Invalid appointment data", error: error.message });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAppointment(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Medical Records
  app.get("/api/patients/:patientId/records", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      const records = await storage.getMedicalRecordsByPatient(patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  app.post("/api/medical-records", async (req, res) => {
    try {
      // Convert visitDate string to Date object if it exists
      const processedData = { ...req.body };
      if (processedData.visitDate) {
        processedData.visitDate = new Date(processedData.visitDate);
      }
      
      const validatedData = insertMedicalRecordSchema.parse(processedData);
      const record = await storage.createMedicalRecord(validatedData);
      res.json(record);
    } catch (error: any) {
      console.error("Medical record creation error:", error);
      res.status(400).json({ message: "Invalid medical record data", error: error.message });
    }
  });

  app.put("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Update medical record data:", req.body);
      
      // Convert visitDate string to Date object if it exists
      const processedData = { ...req.body };
      if (processedData.visitDate) {
        processedData.visitDate = new Date(processedData.visitDate);
      }
      
      const validatedData = insertMedicalRecordSchema.partial().parse(processedData);
      const record = await storage.updateMedicalRecord(id, validatedData);
      res.json(record);
    } catch (error: any) {
      console.error("Medical record validation error:", error);
      res.status(400).json({ message: "Invalid medical record data", error: error.message });
    }
  });

  app.delete("/api/medical-records/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedicalRecord(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete medical record" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/messages/unread", async (req, res) => {
    try {
      const messages = await storage.getUnreadMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid message data", error: error.message });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const message = await storage.markMessageAsRead(id);
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMessage(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  app.put("/api/messages/mark-all-read", async (req, res) => {
    try {
      await storage.markAllMessagesAsRead();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all messages as read" });
    }
  });

  // Search
  app.get("/api/search/patients/condition", async (req, res) => {
    try {
      const condition = req.query.condition as string;
      if (!condition) {
        return res.status(400).json({ message: "Condition parameter is required" });
      }
      const patients = await storage.searchPatientsByCondition(condition);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to search patients by condition" });
    }
  });

  // Reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.array('files', 5), (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Nu au fost uploadate fișiere" });
      }
      
      const files = req.files as Express.Multer.File[];
      const uploadedFiles = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/api/files/${file.filename}`
      }));
      
      res.json({ 
        message: "Fișierele au fost uploadate cu succes",
        files: uploadedFiles 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Eroare la uploadarea fișierelor" });
    }
  });

  // File serving for medical records - serves real uploaded files
  app.get("/api/files/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Fișierul nu a fost găsit" });
      }
      
      // Set appropriate headers based on file type
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg', 
        '.png': 'image/png',
        '.pdf': 'application/pdf',
        '.dcm': 'application/dicom',
        '.dicom': 'application/dicom'
      };
      
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error("File serving error:", error);
      res.status(500).json({ message: "Eroare la servirea fișierului" });
    }
  });

  // Stats for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      const appointments = await storage.getAppointments();
      const upcomingAppointments = await storage.getUpcomingAppointments();
      const unreadMessages = await storage.getUnreadMessages();

      const today = new Date();
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today.toDateString();
      });

      res.json({
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        unreadMessages: unreadMessages.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}