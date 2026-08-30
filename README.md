# Create a Office Management application

## Run Project

- cd frontend
- npm run dev

- cd backend
- venv\Scripts\activate
- uvicorn main:app --reload

## features

- create a dual login interface one for HR(admin) and One for orgainization employees
- create the main page for displaying the main menu
- create login and sign up pages repectively for the orgainization and the HR with respective features

## Organizational Sign up form

- Orgainzational representative can be ceo or Hr

### common inputs

- First name
- Last name
- gender
- age
- Organization name
- Contact info
- email
- username
- Organizational architecture and genre optional
- Organizational headcounts (no of emplyes) optional
- what cultural practices you follow
- upload your profile image
- upload your Orgainzation logo
- password
- confirm password

### HR specific (inputs in signup form)

- years of experience
- Representing any organization or Contract based recruiter
- if represents

  - Organizational architecture and genre
  - Organization Menifesto
  - Organizational headcounts (optional)

## Login page

- username or email
- password

## Main Page Dashboard

### section 1: Navbar on top

### section 2: page (side sidebar + outlet)

#### left sidebar menu with navigation opening pages in outlet (30% screen)---->

- AI Based profile analysis
- Your Organiztion
- current employess/ Employee status
- Application
- Projects
- Stats
- Setting

#### Right outlet menu (70% screen)----->

##### (Ai based profile analysis ) outlet features

- Inputs by hr : (Job role, experience required, key skills you want, write a few lines for Requiremnts to hire)
- Evalute resume
- lindin profile analysis (optional)
- Results: (containing skills and proficiencies for job role, Recommended or not)

##### ( Your Organiztion ) outlet features

- Organization information breifs and the current panel for easy access
- If runing an enterprice level upload your company hirarchy model
- If medium to small scale Upload A csv Info of your current employees with data of names, age, year of joining, pay stage, promotions in last 2 years , contact info, email , cnic

##### ( Employee status ) outlet features

- Active employes in your organization (csv upload)
- Total new hires this year/ last 2,3,4,5 years
- Any layoffs history in last year
