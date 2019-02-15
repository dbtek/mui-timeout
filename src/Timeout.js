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
    remainin: 0,
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
    if (this.trigger) {
      clearTimeout(this.trigger)
    }
  }

  handleTick = () => {
    const now = new Date()
    const { interval, end } = this.props
    const remaining = differenceInSeconds(end, now)
    if (remaining <= interval * 60) {
      if (!this.state.open) this.setState({ open: true })
    } else {
      if (this.state.open) this.setState({ open: false })
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
    const { title, content, color, actionButtonText, onActionClick } = this.props
    if (ended) {
      return (
        <Dialog open={open}>
          <DialogTitle>{title.ended}</DialogTitle>
          <DialogContent>
            <DialogContentText>{content.ended}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={e => onActionClick(true)}>
              {actionButtonText.ended}
            </Button>
          </DialogActions>
        </Dialog>
      )
    }

    return (
      <Dialog open={open}>
        <LinearProgress variant="determinate" value={progress} color={color} />
        <DialogTitle>{title.inform}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content.inform}</DialogContentText>
          {remaining && <DialogContentText>Remaining: {format(new Date(remaining * 1000), 'mm:ss')}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={e => onActionClick(false)}>{actionButtonText.inform}</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
