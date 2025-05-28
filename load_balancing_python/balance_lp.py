import json
import pulp as p

# Parse the input file and return tasks and members
def parse_json():
    # Read the input.json file
    with open("input.json", "r") as f:
        data = json.load(f)

    # Access tasks and members
    return data["tasks"], data["members"]

# Create variables for each task-member pair
def create_variables(tasks, members):
    # Create a dictionary of variables
    variables = {}

    # Create a binary variable for each task-member pair
    for task in tasks:
        for member in members:
            variables[(task["id"], member["id"])] = p.LpVariable(name=f"{task['id']},{member['id']}", cat='Binary')

    return variables

def score(task, member, preference_vs_urgency=0.3):

    score = 0

    preference_weight = preference_vs_urgency
    urgency_weight = 1 - preference_vs_urgency

    # Always count skill match heavily
    for skill in task["skills"]:
        if skill in member["skills"]:
            score += 10

    # Team leader preference slider affects:
    if task["type"] in member["preferences"]:
        score += preference_weight * 10  # scaled to match skill match

    urgency = task.get("urgency", 1)
    experience = member.get("experience", 1)
    score += urgency_weight * urgency * experience

    return score

# parse the solution and return the assignments
def parse_solution(variables):
    # Parse the solution
    solution = {}
    for task in tasks:
        for member in members:
            if p.value(variables[(task["id"],member["id"])]) == 1:
                solution[task["id"]] = member["id"]
    return solution

# Create a LP Maximization problem 
problem = p.LpProblem('Problem', p.LpMaximize)  

# Create problem Variables
tasks, members = parse_json()
variables = create_variables(tasks, members)

# Maximize total score
problem += p.lpSum([
    score(task, member) * variables[(task["id"], member["id"])]
    for task in tasks
    for member in members
])

# Each task is assigned to exactly one member
for task in tasks:
    if task.get("assignedTo"):  # Respect pre-assigned tasks
        assigned_member = task["assignedTo"]
        problem += variables[(task["id"], assigned_member)] == 1
    else:
        problem += sum(variables[(task["id"], member["id"])] for member in members) == 1

# Each member can't exceed their availability
for member in members:
    problem += sum(variables[(task["id"], member["id"])] * task["weight"] for task in tasks) <= member["availability"]

# Solve the problem
problem.solve()
assignments = parse_solution(variables)

# Write to output file
output_file_path = "output.json"  # Ensure this matches the API expectations
with open(output_file_path, "w") as f:
    json.dump(assignments, f)