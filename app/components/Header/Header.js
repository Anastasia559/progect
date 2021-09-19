import React from 'react';
import PropTypes from 'prop-types'


const Header = ({onLogIn, onLogOut}) => {
    return (
        <header className={classes.header}>
            <img src="./logos.png" />
            <b className={classes.b}>Образовательный портал</b>
            <input type="button" value="Выйти" onClick={onLogOut} />
        </header>
    )
}

Header.propTypes = {
    onLogIn: PropTypes.func.isRequired,
    onLogOut: PropTypes.func.isRequired
}

export default Header;