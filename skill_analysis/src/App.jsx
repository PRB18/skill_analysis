import SkillInput from "./SkillInput.jsx"
import OpportunityCard from "./OpportunityCard.jsx"


function App() {

  const missingSkills = {
    //id:1,
    //role: "backend dev",
    mskills: ["React", "MongoDB", "Node"]
  }
  const companyList = [{
    id: 1,
    role: "Web Dev",
    company: "infosys",
    rskills: ["React", "MongoDB", "Node"],
    oskills: ["python", "devops"]
  },
  {
    id: 2,
    role: "backend dev",
    company: "cognizant",
    rskills: ["python", "ml"],
    oskills: ["css", "docker"]
  }

  ]
  return (
    <>
      {companyList.map(job => (
        <OpportunityCard
          key={job.id}
          role={job.role}
          company={job.company}
          rskills={job.rskills}
          oskills={job.oskills}
          userskills={missingSkills.mskills}
        />
      ))}
    </>
  )
}
export default App