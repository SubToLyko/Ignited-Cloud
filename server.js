const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

// 🔒 Your secret key stays hidden on Render — never in your GitHub repo
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
      return res.json({ success: false, message: data.errors[0].detail });
    }

    res.json({
      success: true,
      message: "Server created! Check your FreeGameHost panel.",
      serverId: data.attributes.id
    });

  } catch (err) {
    res.json({ success: false, message: "Something went wrong. Try again!" });
  }
});

// 🩺 Health check — confirms your API is alive
app.get("/", (req, res) => {
  res.send("🔥 Ignited Cloud API is running!");
});

// 🚀 Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Ignited Cloud API running on port ${PORT}`);
});
