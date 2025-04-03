# SkillFlow

SkillFlow is an interactive visualization tool for mapping personal and professional development paths. It helps users track and visually present their learning journey.

## Overview

SkillFlow provides a dynamic, web-based visualization of educational and professional achievements, planned learning paths, and certification requirements. Think of it as a "skill tree" for real-world learning and development.

### Key Features

- Interactive visualization of learning paths and achievements
- Track courses, certifications, and professional development
- Visualize prerequisites and relationships between learning objectives
- Group related items by knowledge domains
- Filter view by specific programs or objectives
- Track certification maintenance requirements
- Plan future learning paths

## Technology Stack
[TBD]


## Getting Started

### Prerequisites
[TBD]


### Installation
[TBD]


## Data Structure
Training is going to be captured in a JSON format likely similar to:

json

{
  "id": "UNIQUE_ITEM_ID",
  "name": "Item Name",
  "type": "Course|Certification|Module|Skill|Milestone|MaintenanceActivity",
  "tags": ["Tag1", "Tag2"],
  "programs": ["ProgramID"],
  "domain": "Knowledge Domain",
  "status": "Planned|In Progress|Completed|Expired",
  "completion_date": "YYYY-MM-DD",
  "expiry_date": "YYYY-MM-DD",
  "provider": "Provider Name",
  "notes": "Additional Information",
  "prerequisites": ["PREREQ_ID_1", "PREREQ_ID_2"],
  "maintenance_contribution_for": ["CERT_ID_1"]
}

## Usage
[TBD]

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License
See LICENSE file

## Acknowledgments
Inspired by video game skill trees and a desire to more effectively plan personal and professional development

## Project Status
This project is currently in early development. Features and documentation will be added incrementally.