//import PropTypes from 'prop-types'

function OpportunityCard(props) {
    return (
        <>
            <div>
                <h4>{props.id}</h4>
                <h1>{props.role}</h1>
                <h2>{props.company}</h2>
                <h3>Required SKills:</h3>
                <h3><ol>
                    {props.rskills.map(
                        rskill => <li key={props.rskills}>
                            {rskill}
                        </li>
                    )}
                </ol></h3>
                <h3>Optional Skills</h3>
                <h3><ol>
                    {props.oskills.map(
                        oskill => <li key={props.oskills}>
                            {oskill}
                        </li>
                    )}
                </ol></h3>
                <h3>Skills having:</h3>
                <h3><ol>
                    {props.skills.map(
                        skill => <li key={props.skills}>
                            {skill}
                        </li>
                    )}
                    </ol></h3>
                {props.skills.length === 0 ? <h1>100% match</h1> : <h1>doesnt fully match</h1>}
            </div>
        </>
    )
}


export default OpportunityCard