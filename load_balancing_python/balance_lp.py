import json
import pulp as p
import os 

# Parse the input file and return tasks and members
def parse_json():
    base_dir = os.path.dirname(__file__)
    input_path = os.path.join(base_dir, "input.json")
    with open(input_path, "r") as f:
        data = json.load(f)
    return data["tasks"], data["members"]

# Convert task priority to weight
def priority_to_weight(priority):
    return {
        'low': 1,
        'medium': 3,
        'high': 5
    }.get(str(priority).lower(), 2)  # default to 2 if unknown

# Create variables for each task-member pair
def create_variables(tasks, members):
    variables = {}
    for task in tasks:
        for member in members:
            variables[(task["id"], member["id"])] = p.LpVariable(name=f"{task['id']},{member['id']}", cat='Binary')
    return variables

# Scoring function
def score(task, member, preference_vs_urgency=0.3):
    score = 0
    preference_weight = preference_vs_urgency
    urgency_weight = 1 - preference_vs_urgency

    for skill in task["skills"]:
        if skill in member["skills"]:
            score += 10
        if skill in member["preferences"]:
            score += preference_weight * 10

    urgency = task.get("urgency", 1)
    experience = member.get("experience", 1)
    score += urgency_weight * urgency * experience
    return score

# Parse the solution
def parse_solution(variables, tasks, members):
    solution = {}
    for task in tasks:
        for member in members:
            if p.value(variables[(task["id"], member["id"])]) == 1:
                solution[task["id"]] = member["id"]
    return solution

# Main optimization
problem = p.LpProblem('Problem', p.LpMaximize)

# Get tasks and members
tasks, members = parse_json()

# Add weight field to tasks based on priority
for task in tasks:
    task["weight"] = priority_to_weight(task.get("priority", "medium"))

# Create variables
variables = create_variables(tasks, members)

# Objective: maximize total score
problem += p.lpSum([
    score(task, member) * variables[(task["id"], member["id"])]
    for task in tasks
    for member in members
])

# Each task assigned to exactly one member
for task in tasks:
    if task.get("assignedTo"):
        assigned_member = task["assignedTo"]
        problem += variables[(task["id"], assigned_member)] == 1
    else:
        problem += p.lpSum([variables[(task["id"], member["id"])] for member in members]) == 1

# Member availability constraint
for member in members:
    problem += p.lpSum([
        variables[(task["id"], member["id"])] * task["weight"]
        for task in tasks
    ]) <= member["availability"]

# Solve the problem
problem.solve()
assignments = parse_solution(variables, tasks, members)

# Output to file
output_file_path = os.path.join(os.path.dirname(__file__), "output.json")
with open(output_file_path, "w") as f:
    json.dump(assignments, f)
