import React from 'react';

import View from '../../components/Messages/Messages';



//export function Messages(props)
class Messages extends React.Component {

  constructor(props) {
    super(props);
    this.state = { opened: false, text: null, type: null }
    this.setOpenedAction = this.setOpenedAction.bind(this)
  }


  setOpenedAction(e) {
    this.setState({ opened: e })
  }

  render() {
    const props = {
      ...this.state,
      setOpened: this.setOpenedAction,
    }
    console.log({ props })
    return (
      <View {...props} />
    )
  }



}

export default Messages;