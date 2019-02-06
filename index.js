import React, { Component } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, LinearProgress
} from '@material-ui/core'
import { differenceInMilliseconds, subMinutes, format } from 'date-fns'
import {
  Refresh as RefreshIcon
} from '@material-ui/icons'
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
    actionButtonText: 'Extend'
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
    const triggerTime = subMinutes(this.props.end, this.props.interval)
    const remaining = differenceInMilliseconds(triggerTime, new Date())
    if (remaining > 0) {
      this.trigger = setTimeout(this.handleInform, remaining)
    }
  }

  componentWillUnmount () {
    if (this.ticker) {
      clearInterval(this.ticker)
    }
    if (this.trigger) {
      clearTimeout(this.trigger)
    }
  }

  handleInform = () => {
    this.setState({ open: true })
    this.ticker = setInterval(this.handleTick, 1000)
  }

  handleTick = () => {
    const remaining = differenceInMilliseconds(this.props.end, new Date())
    if (remaining <= 0) {
      if (!this.ticker) return
      this.setState({ ended: true, progress: 1 })
      clearInterval(this.ticker)
    } else {
      const total = this.props.interval * 60000
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
            <Button color="primary" onClick={e => window.location.reload()}>
              <RefreshIcon style={{ fontSize: 16, marginRight: 5 }} />
              Reload
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
          {remaining && <DialogContentText>Remaining: {format(remaining, 'mm:ss')}</DialogContentText>}
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={onActionClick}>{actionButtonText}</Button>
        </DialogActions>
      </Dialog>
    )
  }
}
