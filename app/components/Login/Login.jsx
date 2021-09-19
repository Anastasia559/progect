import React from 'react'
import PropTypes from 'prop-types'
import { Storage2 } from '../../storage';
import { ERROR_CONNECTION, USER_NOT_FOUND, USER_NOT_LOGGED_IN } from './../../constants/errorCodes';


import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Messages from '../Messages/Messages';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));


const Login = ({ login, password, result, message, onClick, onLoginChange, onPasswordChange }) => {
    const classes = useStyles();

 
    if (Storage2.authorized) {
        return (<div><b>*Storage2.authorized* {Storage2.user.username}</b></div>);
    }
    return (
        <Container component="main" maxWidth="xs">
            {message}
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Войти
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Логин"
                        name="login"
                        autoComplete="login"
                        autoFocus
                        value={login || ''}
                        onChange={onLoginChange}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Пароль"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password || ''}
                        onChange={onPasswordChange}
                    />
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={onClick}
                    >
                        Войти
                    </Button>
                </form>
            </div>
        </Container>


 
    );
}

Login.propTypes = {
    login: PropTypes.string,
    password: PropTypes.string,
    result: PropTypes.object,
    message: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    onLoginChange: PropTypes.func.isRequired,
    onPasswordChange: PropTypes.func.isRequired
}

export default Login;