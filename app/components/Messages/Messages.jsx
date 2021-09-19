import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

//export function Messages(props)
const Messages = ({ opened, setOpenedAction, text, type }) => {
  const classes = useStyles();

  return (

    <div className={classes.root}>
      <Collapse in={opened}>
        <Alert severity={type}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={setOpenedAction}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {text}
        </Alert>
      </Collapse>
    </div>


  )
}


Messages.propTypes = {
  opened: PropTypes.string,
  text: PropTypes.string,
  type: PropTypes.object,
  setOpenedAction: PropTypes.func.isRequired
}

export default Messages;





