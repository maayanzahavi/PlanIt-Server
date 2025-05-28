const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const Project = require("../models/project"); // Assuming a Project model exists

const runLoadBalancer = async (req, res) => {
  const { projectId } = req.req; // Accept project ID and pre-assignments
  const scriptPath = path.join(__dirname, "../load_balancing_python/balance_lp.py");
  const inputPath = path.join(__dirname, "../load_balancing_python/input.json");
  const outputPath = path.join(__dirname, "../load_balancing_python/output.json");

  try {
    // Fetch project details
    const project = await Project.findById(projectId).populate("tasks team"); // Assuming tasks and team are populated
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Format data for input.json
    const inputData = {
      tasks: project.tasks.map(task => ({
        id: task._id.toString(),
        skills: task.tags.map(tag => tag.name), 
        type: task.type,
        weight: task.weight,
        urgency: task.urgency,
        assignedTo: task.assignedTo || null 
      })),
      members: project.team.map(member => ({
        id: member._id.toString(),
        skills: member.skills.map(skill => skill.name),
        preferences: member.preferences,
        availability: member.availability,
        experience: member.experience
      }))
    };

    // Write to input.json
    fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));

    // Execute the Python script
    exec(`python3 ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).json({ error: "Failed to execute load balancing algorithm" });
      }

      if (stderr) {
        console.error(`Script error: ${stderr}`);
      }

      // Read the output file
      fs.readFile(outputPath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading output file: ${err.message}`);
          return res.status(500).json({ error: "Failed to read output file" });
        }

        try {
          const assignments = JSON.parse(data);
          console.log("Load balancing assignments:", assignments);
          res.status(200).json(assignments);
        } catch (parseError) {
          console.error(`Error parsing output file: ${parseError.message}`);
          res.status(500).json({ error: "Failed to parse output file" });
        }
      });
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { runLoadBalancer };
