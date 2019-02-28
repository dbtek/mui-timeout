import React, { Component } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, LinearProgress
} from '@material-ui/core'
import { differenceInSeconds, subMinutes, format, isAfter } from 'date-fns'
import PropTypes from 'prop-types'

export default class TimeoutDialog extends Component {
  state = {
    open: false,
    progress: 0,
    remaining: 0,
  }

  static defaultProps = {
    interval: 5, // inform before timeout, remaining time (in minutes)
    color: 'secondary',
    title: {
      ended: 'Session ended',
      inform: 'Your session about to end'
    },
    content: {
      ended: 'Sorry, to continue using application please refresh page.',
      inform: 'Do you want to continue?'
    },
    actionButtonText: {
      ended: 'Reload',
      inform: 'Extend'
    }
  }

  static propTypes = {
    end: PropTypes.instanceOf(Date).isRequired,
    interval: PropTypes.number.isRequired,
    color: PropTypes.oneOf(['primary', 'secondary']),
    title: PropTypes.shape({
      ended: PropTypes.string,
      inform: PropTypes.string,
    }),
    content: PropTypes.shape({
      ended: PropTypes.string,
      inform: PropTypes.string,
    }),
    onActionClick: PropTypes.func.isRequired
  }

  componentWillMount () {
    this.ticker = setInterval(this.handleTick, 1000)    
  }

  componentWillUnmount () {
    if (this.ticker) {
      clearInterval(this.ticker)
    }
  }

  handleTick = () => {
    const now = new Date()
    const { interval, end } = this.props
    const remaining = differenceInSeconds(end, now)
    if (remaining <= interval * 60) {
      if (!this.state.open) this.setState({ open: true })
    } else {
      if (this.state.open) this.setState({ open: false, ended: false })
      return
    }
    if (remaining <= 0) {
      if (!this.ticker) return
      this.setState({ ended: true, progress: 1 })
      clearInterval(this.ticker)
    } else {
      const total = this.props.interval * 60
      this.setState({ progress: 100 * (total - remaining) / total, remaining })
    }
  }

  render () {
    const { open, progress, remaining, ended } = this.state
    const { inform: informProps, ended: endedProps, color } = this.props
    if (ended) {
      return (
        <Dialog open={open}>
          <DialogTitle>{endedProps.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{endedProps.content}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" {...endedProps.actionButtonProps} />
          </DialogActions>
        </Dialog>
      )
    }

    return (
      <Dialog open={open}>
        <LinearProgress variant="determinate" value={progress} color={color} />
        <DialogTitle>{informProps.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{informProps.content}</DialogContentText>
          {remaining && <DialogContentText>Remaining: {format(new Date(remaining * 1000), 'mm:ss')}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button color="primary" {...informProps.actionButtonProps} />
        </DialogActions>
      </Dialog>
    )
  }
}
