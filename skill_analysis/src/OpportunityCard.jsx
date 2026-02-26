//import PropTypes from 'prop-types'

function OpportunityCard(props) {

        return (
            <div>
                {props.role} <br /> {props.company} <br /> <b>{props.rskills}</b> <br /> {props.oskills} <br />
                {props.userskills.length === props.rskills.length &&
                    props.rskills.every(item => props.userskills.includes(item)) ? <h3>100% match!</h3>
                    : <h3>doesnt entirely match!</h3>}
            </div>
        )
    
}


export default OpportunityCard