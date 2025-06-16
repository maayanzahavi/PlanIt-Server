const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const taskService = require("../services/task"); 
const projectService = require("../services/project"); 
const userService = require("../services/user"); 
const { time } = require("console");

const parseDataToInputFile = (project, inputPath) => {
  console.log("Formatting data for input.json");
  console.log("Project tasks:", project.tasks);

  // Calculate weeks left until deadline to use later
  const now = Date.now();
  const weeksLeft = (new Date(project.deadline).getTime() - now) / (1000 * 60 * 60 * 24 * 7) + 1;
  console.log("Weeks left until deadline:", weeksLeft);

  const teamSize = project.team.length;

    // Format data for input.json
    const inputData = {
        tasks: project.tasks.map(task => ({
          id: task._id.toString(),
          skills: task.tags.map(tag => tag._id),
          priority: task.priority === "High" ? 5 : task.priority === "Medium" ? 3 : 1,
          assignedTo: task.assignedTo && task.assignedTo._id || null,
        })),
        members: project.team.map(member => ({
          id: member._id.toString(),
          skills: member.skills.map(skill => skill),
          preferences: member.preferences,
          availability: (((project.availabilities && project.availabilities[member._id.toString()]) || 0) * weeksLeft) / teamSize * 2, 
          experience: member.experience
        })),
        preference_vs_urgency: project.preferencesWeight || 0.5, 
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
        // Assign the task to the user
        task.assignedTo = assignedUserId; 
        await taskService.updateTask(task._id, { assignedTo: assignedUserId }); 

        // Add task to user's tasks
        await userService.addTaskToUser(assignedUserId, task._id);
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

  // Save useful paths
  const scriptPath = path.join(__dirname, "../load_balancing_python/balance_lp.py");
  const inputPath = path.join(__dirname, "../load_balancing_python/input.json");
  const outputPath = path.join(__dirname, "../load_balancing_python/output.json");

  console.log("Running load balancer with project:", project.title);
  console.log("Team skills:", project.team.map(member => member.skills.map(skill => skill)));

  // Validate project object
  if (!project || !project.tasks || !project.team) {
    return res.status(400).json({ error: "Invalid project data" });
  }

  try {
    // Export data to input file
    parseDataToInputFile(project, inputPath);

    // Execute the Python script
    exec(`python ${scriptPath}`, async (error, stdout, stderr) => {
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
