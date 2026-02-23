import SkillInput from "./SkillInput.jsx"
import OpportunityCard from "./OpportunityCard.jsx"


function App() {
  return (
    <>
      <OpportunityCard role="Web Dev" company="infosys" rskills="React,MongoDB,Node" oskills="python,devops"/>
      <OpportunityCard role="backend dev" company="cognizant" rskills="python,ml" oskills="css,docker" />
      <OpportunityCard />
      <SkillInput/>
    </>
  )

}
export default App