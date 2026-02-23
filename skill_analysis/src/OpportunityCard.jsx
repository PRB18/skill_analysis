import PropTypes from 'prop-types'

function OpportunityCard({ 
    role = "None", 
    company = "None", 
    rskills = "None", 
    oskills = "None",
    ...props 
}) {
    return(
        <div className="OpportunityCard" {...props}>
            <h1>{role}</h1>
            <h3>{company}</h3>
            <p>{rskills}</p>
            <p>{oskills}</p>
        </div>
    )
}

OpportunityCard.propTypes = {
    role: PropTypes.string,
    company: PropTypes.string,
    rskills: PropTypes.string,
    oskills: PropTypes.string
};

export default OpportunityCard