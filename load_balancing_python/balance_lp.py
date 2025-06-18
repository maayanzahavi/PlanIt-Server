import json
import pulp as p
import os 

# Parse the input file and return tasks, members, and urgency weight
def parse_input_json():
    base_dir = os.path.dirname(__file__)
    input_path = os.path.join(base_dir, "input.json")
    with open(input_path, "r") as f:
        data = json.load(f)

    return data["tasks"], data["members"], data["preference_vs_urgency"]

# Create variables for each task-member pair
def create_variables(tasks, members):
    variables = {}
    for task in tasks:
        for member in members:
            variables[(task["id"], member["id"])] = p.LpVariable(name=f"{task['id']},{member['id']}", cat='Binary')
    return variables

# Calculate the score for a task-member pair
def score(task, member, preference_vs_urgency=0.3):
    score = 0
    preference_weight = preference_vs_urgency
    urgency_weight = 1 - preference_vs_urgency

    for skill in task["skills"]:
        if skill in member["skills"]:
            # If the member has this skill, increase the score based on urgency weight
            score += urgency_weight * BASE_SCORE
        if skill in member["preferences"]:
            # If the member prefers this skill, increase the score based preference weight
            score += preference_weight * BASE_SCORE

    priority = task.get("priority", 2)
    experience = member.get("experience", 1)
    score += urgency_weight * priority * experience
    return score

# Parse the solution
def parse_solution(variables, tasks, members):
    solution = {}
    for task in tasks:
        for member in members:
            if p.value(variables[(task["id"], member["id"])]) == 1:
                solution[task["id"]] = member["id"]
    return solution

# Constants
BASE_SCORE = 10 # Base score for a task-member pair
AVG_TASK_WORKLOAD = 6 # An average workload for a task

# Main optimization
problem = p.LpProblem('Load Balance', p.LpMaximize)

# Get tasks, members, and preference_vs_urgency from JSON
tasks, members, preference_vs_urgency = parse_input_json()

MAX_URGENT_TASKS_PER_MEMBER  = (len(tasks) // len(members)) * 2 # Maximum number of urgent tasks per member

# Create variables
variables = create_variables(tasks, members)

# Objective: maximize total score
problem += p.lpSum([
    score(task, member, preference_vs_urgency) * variables[(task["id"], member["id"])]
    for task in tasks
    for member in members
])

# Make sure each task is assigned to exactly one member
for task in tasks:
    problem += p.lpSum([variables[(task["id"], member["id"])] for member in members]) == 1

# Make sure each member is assigned to at lest one task
if len(members) <= len(tasks):
    for member in members:
        problem += p.lpSum([variables[(task["id"], member["id"])] for task in tasks]) >= 1

# Member availability constraint
for member in members:
    problem += p.lpSum([
        variables[(task["id"], member["id"])] * AVG_TASK_WORKLOAD
        for task in tasks
    ]) <= member["availability"]

# Ensure all members has a limit of high priority tasks
for member in members:
    problem += p.lpSum([
        variables[(task["id"], member["id"])]
        for task in tasks if task["priority"] == 5
    ]) <= MAX_URGENT_TASKS_PER_MEMBER

# Solve the problem
problem.solve()
assignments = parse_solution(variables, tasks, members)

# Output to file
output_file_path = os.path.join(os.path.dirname(__file__), "output.json")
with open(output_file_path, "w") as f:
    json.dump(assignments, f)
