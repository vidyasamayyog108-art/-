import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Management
  app.get("/api/users", async (req, res) => {
    // This would fetch from Firestore on the server
    res.json({ message: "User list endpoint" });
  });

  // Payment Integration (Mock)
  app.post("/api/payments/create-intent", async (req, res) => {
    const { amount, planId } = req.body;
    console.log(`Creating payment intent for ${amount} on plan ${planId}`);
    res.json({ 
      clientSecret: "mock_secret_123", 
      message: "This would normally integrate with Stripe or Razorpay" 
    });
  });

  // Smart Search (Custom Logic)
  app.get("/api/search", async (req, res) => {
    const { query } = req.query;
    console.log(`Server-side smart search for: ${query}`);
    res.json({ 
      results: [], 
      message: "Refined server-side search results" 
    });
  });

  // Notification Service
  app.post("/api/notifications/send", async (req, res) => {
    const { userId, message } = req.body;
    console.log(`Sending notification to ${userId}: ${message}`);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
