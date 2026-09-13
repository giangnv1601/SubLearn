# SubLearn - English Learning via Movies Website

## 1. Introduction
This is a system that supports learning English through movies by providing exercises based on the movie's content. The project aims to overcome the limitations of traditional learning methods (which are often theory-heavy, fragmented, and lacking in context) as well as the drawbacks of spontaneous movie-based learning (which lacks a systematic approach and proper support tools).

## 2. Key Features
The system is divided into two main user groups with the following features:

### For Users:
* **Bilingual Movie Player:** Watch movies with bilingual subtitles (English and Vietnamese).
* **Flexible Subtitle Modes:** Easily switch between subtitle modes (Bilingual, English only, or Vietnamese only).
* **Real-time Interactive Exercises:** Engage with interactive exercises right while watching, helping learners transition from passive viewing to active interaction.
* **Practice & Tracking:** View the list of exercise types by movie, complete exercises, and check practice results.

### For Admin:
* **Movie Management:** Manage the movie catalog, including adding new movies, editing movie information, deleting movies, and uploading subtitles to the system.
* **Exercise Management:** Manage the exercise system, allowing admins to view the list of exercises by movie, edit, and delete them.
* **AI-Powered Exercise Generation:** Utilize OpenAI's large language model (model GPT-4.1) to automatically generate exercises from selected movie subtitles.

## 3. Tech Stack
* Frontend: ReactJS, TailwindCSS
* Backend: NodeJS (Express), MongoDB, OpenAI API, Cloudinary
* Authentication: JSON Web Tokens (JWT)
* Infrastructure: AWS (VPC, ECS, ECR, ALB), Docker

## 4. Architecture Design
* Software architecture selection
![Client-server architecture](docs/images/architecturw-design/client-server.png)
* System architecture design
<table>
<tr>
<td valign="top" width="50%"><img src="docs/images/architecturw-design/fechitiet.png" alt="Frontend package architecture" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/architecturw-design/bechitiet.png" alt="Backend package architecture" width="100%"></td>
</tr>
</table>

* Database design
<table>
<tr>
<td valign="top" width="50%"><img src="docs/images/architecturw-design/ERD-SubLearn.png" alt="SubLearn entity relationship diagram" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/architecturw-design/Schema-SubLearn.png" alt="SubLearn database schema" width="100%"></td>
</tr>
</table>

## 5. Application Implementation
* User
<table>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-home.png" alt="User home page" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-exercise.png" alt="User exercise list" width="100%"></td>
</tr>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-player.png" alt="User movie player" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-interactive-exercise.png" alt="User interactive exercise" width="100%"></td>
</tr>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-interactive-exercise2.png" alt="User interactive exercise results" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-doexercise.png" alt="User exercise page" width="100%"></td>
</tr>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-submitexercise.png" alt="User submitted exercise" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/user-result.png" alt="User results page" width="100%"></td>
</tr>
</table>
* Admin
<table>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/admin-user.png" alt="Admin user management" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/admin-movie.png" alt="Admin movie management" width="100%"></td>
</tr>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/admin-exercise.png" alt="Admin exercise management" width="100%"></td>
<td valign="top" width="50%"><img src="docs/images/application-implementation/admin-addquiz.png" alt="Admin add quiz" width="100%"></td>
</tr>
<tr>
<td valign="top" width="50%"><img src="docs/images/application-implementation/admin-addquiz1.png" alt="Admin add quiz with questions" width="100%"></td>
<td valign="top" width="50%"></td>
</tr>
</table>

## 6. Deployment
* Design
	* Network Design
		![Network design](docs/images/deployment/network-design.png)
	* Security Design
		![Security design](docs/images/deployment/Sercurity-Design.png)
	* Server and Resource
		![Server and resource design](docs/images/deployment/Service-and-resource-design.png)

* Result
	* VPC
		![VPC](docs/images/deployment/VPC.png)
	* Load Balancer
		![Load balancer](docs/images/deployment/load-balancers.png)
	* ECS
		![ECS](docs/images/deployment/ECS.png)
	* Target Group
		<table>
		<tr>
		<td valign="top" width="50%"><img src="docs/images/deployment/backend-tg.png" alt="Backend target group" width="100%"></td>
		<td valign="top" width="50%"><img src="docs/images/deployment/frontend-tg.png" alt="Frontend target group" width="100%"></td>
		</tr>
		</table>
	* Image Result
		![Deployment result](docs/images/deployment/result-deploy.png)