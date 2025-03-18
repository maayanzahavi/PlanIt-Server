import json
import pulp as p

# Parse the input file and return tasks and members
def parse_json():
    # Read the input.json file
    with open("python-algo/input.json", "r") as f:
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
            variables[(task["id"], member["id"])] = p.LpVariable(name=f"{task["id"]},{member["id"]}", cat='Binary')

    return variables

# Calculate the score of a task-member pair
def score(task, member):
    score = 0
    for skill in task["skills"]:
        if skill in member["skills"]:
            score += 2
    if task["type"] in member["preferences"]:
        score += 1
    return score

# parse the solution and return the assignments
def parse_solution(variables):
    # Parse the solution
    solution = {}
    for task in tasks:
        for member in members:
            if p.value(variables[(task["id"], member["id"])]) == 1:
                solution[task["id"]] = member["id"]
    return solution

# Create a LP Maximization problem 
problem = p.LpProblem('Problem', p.LpMaximize)  

# Create problem Variables
tasks, members = parse_json()
variables = create_variables(tasks, members)

# Maximize total score
for task in tasks:
    for member in members:
       problem += score(task, member) * variables[(task["id"], member["id"])]

# Each task is assigned to exactly one member
for task in tasks:
    problem += sum(variables[(task["id"], member["id"])] for member in members) == 1

# Each member can't exceed their availability
for member in members:
    problem += sum(variables[(task["id"], member["id"])] * task["time"] for task in tasks) <= member["availability"]

# Solve the problem
problem.solve()
assignments = parse_solution(variables)

# Write to output file
with open("python-algo/output.json", "w") as f:
    json.dump(assignments, f)