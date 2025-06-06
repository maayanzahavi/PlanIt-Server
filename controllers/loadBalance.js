const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const taskService = require("../services/task"); // Assuming a projectService exists
const projectService = require("../services/project"); // Assuming a projectService exists

const formatData = (project, inputPath) => {
    // Format data for input.json
    const inputData = {
        tasks: project.tasks.map(task => ({
          id: task._id.toString(),
          skills: task.tags.map(tag => tag._id),
          type: task.type,
          weight: task.weight,
          urgency: task.urgency,
          assignedTo: task.assignedTo._id || null,
          availabilities: project.availabilities || {} // Include task-specific availabilities
        })),
        members: project.team.map(member => ({
          id: member._id.toString(),
          skills: member.skills.map(skill => skill),
          preferences: member.preferences,
          availability: (project.avaliabilites && project.avaliabilites[member._id.toString()]) || 0, // Fallback to 0 if undefined
          experience: member.experience
        }))
      };
  
      // Write to input.json
      fs.writeFileSync(inputPath, JSON.stringify(inputData, null, 2));
    };

const parseAssignments = async (project, outputPath) => {
  try {
    // Read the output file
    const data = fs.readFileSync(outputPath, "utf8");
    const assignments = JSON.parse(data);
    console.log("Assignments from output file:", assignments);

    // Update tasks with new assignments
    project.tasks.forEach(async task => {
      const assignedUserId = assignments[task._id.toString()];
      if (assignedUserId) {
        task.assignedTo = assignedUserId; // Correctly assign the user ID
        await taskService.updateTask(task._id, { assignedTo: assignedUserId }); // Pass the user ID to updateTask
      }
    });
    console.log("Assignments updated in project:", project.tasks);
    return project;
  } catch (err) {
    console.error(`Error parsing assignments: ${err.message}`);
    throw new Error("Failed to parse assignments");
  }
};

const runLoadBalancer = async (req, res) => {
  console.log("Request body:", req.body);
  const projectId = req.params.projectId;
  const project = req.body; 
  const scriptPath = path.join(__dirname, "../load_balancing_python/balance_lp.py");
  const inputPath = path.join(__dirname, "../load_balancing_python/input.json");
  const outputPath = path.join(__dirname, "../load_balancing_python/output.json");


  console.log("Running load balancer with project:", project.title);
  console.log("Team skills:", project.team.map(member => member.skills.map(skill => skill)));

  try {
    // Validate project object
    if (!project || !project.tasks || !project.team) {
      return res.status(400).json({ error: "Invalid project data" });
    }

    // Export data to input file
    formatData(project, inputPath);

    // Execute the Python script
    exec(`python3 ${scriptPath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return res.status(500).json({ error: "Failed to execute load balancing algorithm" });
      }

      if (stderr) {
        console.error(`Script error: ${stderr}`);
      }

      try {
        // Use parseAssignments to update the project 
        // and return the project with updates task assignments
        const updatedProject = await parseAssignments(project, outputPath);
        console.log("Updated project with assignments:", updatedProject.tasks);
        const finalProject = await projectService.updateProject(projectId, updatedProject);
        res.status(200).json(finalProject);
      } catch (parseError) {
        console.error(`Error updating project: ${parseError.message}`);
        res.status(500).json({ error: "Failed to update project with assignments" });
      }
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { runLoadBalancer };
