import SkillInput from "./SkillInput.jsx"
import OpportunityCard from "./OpportunityCard.jsx"


function App() {

  /*const missingSkills = {
    id:1,
    role: "backend dev",
    company: "rajsheker factory",
    mskills: []
  }
  const companyList = [{
    id:1,
    role: "Web Dev",
    company: "infosys",
    rskills: ["React", "MongoDB", "Node"],
    oskills: ["python", "devops"]
  },
  {
    id:2,
    role: "backend dev",
    company: "cognizant",
    rskills: ["python", "ml"],
    oskills: ["css", "docker"]
  }

  ]*/
  return (
    <>
      <OpportunityCard id={1} role="backend dev" company="infosis" rskills={["python","git","flask","react","api"]} 
                        oskills={["word","excel"]} skills={[]}/>
      <SkillInput />
    </>
  )

}
export default App