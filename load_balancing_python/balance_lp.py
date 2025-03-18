import json
import pulp as p

def parse_json():
    # Read the input.json file
    with open("python-algo/input.json", "r") as f:
        data = json.load(f)

    # Access tasks and members
    return data["tasks"], data["members"]

def create_variables(tasks, members):
    # Create a dictionary of variables
    variables = {}

    # Create a binary variable for each task-member pair
    for task in tasks:
        for member in members:
            variables[(task, member)] = p.LpVariable(name=f"{task},{member}", lowBound=0, upBound=1, cat='Integer')


# Create a LP Maximization problem 
Lp_prob = p.LpProblem('Problem', p.LpMaximize)  

# Create problem Variables
tasks, members = parse_json()
variables = create_variables(tasks, members)

