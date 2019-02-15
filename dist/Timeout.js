function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, LinearProgress } from '@material-ui/core';
import { differenceInMilliseconds, subMinutes, format, isAfter } from 'date-fns';
import PropTypes from 'prop-types';
export default class TimeoutDialog extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      open: false,
      progress: 0,
      remainin: 0
    });

    _defineProperty(this, "handleInform", () => {
      this.setState({
        open: true
      });
      this.ticker = setInterval(this.handleTick, 1000);
    });

    _defineProperty(this, "handleTick", () => {
      const remaining = differenceInMilliseconds(this.props.end, new Date());

      if (remaining <= 0) {
        if (!this.ticker) return;
        this.setState({
          ended: true,
          progress: 1
        });
        clearInterval(this.ticker);
      } else {
        const total = this.props.interval * 60000;
        this.setState({
          progress: 100 * (total - remaining) / total,
          remaining
        });
      }
    });
  }

  componentWillMount() {
    const now = new Date();
    const triggerTime = subMinutes(this.props.end, this.props.interval);
    if (isAfter(now, triggerTime)) return;
    const remaining = differenceInMilliseconds(triggerTime, now);

    if (remaining > 0) {
      this.trigger = setTimeout(this.handleInform, remaining);
    }
  }

  componentWillUnmount() {
    if (this.ticker) {
      clearInterval(this.ticker);
    }

    if (this.trigger) {
      clearTimeout(this.trigger);
    }
  }

  render() {
    const {
      open,
      progress,
      remaining,
      ended
    } = this.state;
    const {
      title,
      content,
      color,
      actionButtonText,
      onActionClick
    } = this.props;

    if (ended) {
      return React.createElement(Dialog, {
        open: open
      }, React.createElement(DialogTitle, null, title.ended), React.createElement(DialogContent, null, React.createElement(DialogContentText, null, content.ended)), React.createElement(DialogActions, null, React.createElement(Button, {
        color: "primary",
        onClick: e => onActionClick(true)
      }, actionButtonText.ended)));
    }

    return React.createElement(Dialog, {
      open: open
    }, React.createElement(LinearProgress, {
      variant: "determinate",
      value: progress,
      color: color
    }), React.createElement(DialogTitle, null, title.inform), React.createElement(DialogContent, null, React.createElement(DialogContentText, null, content.inform), remaining && React.createElement(DialogContentText, null, "Remaining: ", format(remaining, 'mm:ss'))), React.createElement(DialogActions, null, React.createElement(Button, {
      color: "primary",
      onClick: e => onActionClick(false)
    }, actionButtonText.inform)));
  }

}

_defineProperty(TimeoutDialog, "defaultProps", {
  interval: 5,
  // inform before timeout, remaining time (in minutes)
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
});

_defineProperty(TimeoutDialog, "propTypes", {
  end: PropTypes.instanceOf(Date).isRequired,
  interval: PropTypes.number.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary']),
  title: PropTypes.shape({
    ended: PropTypes.string,
    inform: PropTypes.string
  }),
  content: PropTypes.shape({
    ended: PropTypes.string,
    inform: PropTypes.string
  }),
  onActionClick: PropTypes.func.isRequired
});