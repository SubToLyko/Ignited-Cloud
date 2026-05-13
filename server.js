const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

// Enable CORS so your GitHub Pages site can talk to this API
app.use(cors());
app.options("*", cors());

app.use(express.json());

const API_KEY = process.env.FREEGAMEHOST_API_KEY;
const PANEL_URL = "https://panel.freegamehost.xyz";

// 🚀 Create a Minecraft server
app.post("/create-server", async (req, res) => {
  const { serverName } = req.body;

  if (!serverName) {
    return res.json({ success: false, message: "Please enter a server name!" });
  }

  try {
    const response = await fetch(`${PANEL_URL}/api/application/servers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: serverName,
        user: 1,
        egg: 1,
        docker_image: "ghcr.io/pterodactyl/yolks:java_17",
        startup: "java -Xms128M -Xmx1024M -jar server.jar",
        environment: {
          SERVER_JARFILE: "server.jar",
          VANILLA_VERSION: "latest"
        },
        limits: {
          memory: 1024,
          swap: 0,
          disk: 5120,
          io: 500,
          cpu: 100
        },
        feature_limits: {
          databases: 0,
          allocations: 1,
          backups: 0
        },
        allocation: {
          default: 1
        }
      })
    });

    const data = await response.json();

    if (data.errors) {
      console.error("Pterodactyl error:", data.errors);
      return res.json({ success: false, message: data.errors[0].detail });
    }

    console.log("Server created:", data.attributes?.name);
    res.json({
      success: true,
      message: "Server created successfully!",
      serverId: data.attributes.id,
      serverName: data.attributes.name
    });

  } catch (err) {
    console.error("Create server error:", err);
    res.json({ success: false, message: "Something went wrong. Try again!" });
  }
});

// 📋 List all servers
app.get("/servers", async (req, res) => {
  try {
    const response = await fetch(`${PANEL_URL}/api/application/servers`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Accept": "application/json"
      }
    });
    const data = await response.json();

    if (data.errors) {
      console.error("List servers error:", data.errors);
      return res.json({ success: false, servers: [] });
    }

    const servers = data.data.map(s => ({
      name: s.attributes.name,
      id: s.attributes.id,
      identifier: s.attributes.identifier
    }));

    console.log(`Found ${servers.length} servers`);
    res.json({ success: true, servers });

  } catch (err) {
    console.error("List servers error:", err);
    res.json({ success: false, servers: [] });
  }
});

// 🩺 Health check
app.get("/", (req, res) => {
  res.send("🔥 Ignited Cloud API is running!");
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Ignited Cloud API running on port ${PORT}`);
});
