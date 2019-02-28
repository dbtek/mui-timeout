function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, LinearProgress } from '@material-ui/core';
import { differenceInSeconds, subMinutes, format, isAfter } from 'date-fns';
import PropTypes from 'prop-types';
export default class TimeoutDialog extends Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "state", {
      open: false,
      progress: 0,
      remaining: 0
    });

    _defineProperty(this, "handleTick", () => {
      const now = new Date();
      const {
        interval,
        end
      } = this.props;
      const remaining = differenceInSeconds(end, now);

      if (remaining <= interval * 60) {
        if (!this.state.open) this.setState({
          open: true
        });
      } else {
        if (this.state.open) this.setState({
          open: false,
          ended: false
        });
        return;
      }

      if (remaining <= 0) {
        if (!this.ticker) return;
        this.setState({
          ended: true,
          progress: 1
        });
        clearInterval(this.ticker);
      } else {
        const total = this.props.interval * 60;
        this.setState({
          progress: 100 * (total - remaining) / total,
          remaining
        });
      }
    });
  }

  componentWillMount() {
    this.ticker = setInterval(this.handleTick, 1000);
  }

  componentWillUnmount() {
    if (this.ticker) {
      clearInterval(this.ticker);
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
      inform: informProps,
      ended: endedProps,
      color
    } = this.props;

    if (ended) {
      return React.createElement(Dialog, {
        open: open
      }, React.createElement(DialogTitle, null, endedProps.title), React.createElement(DialogContent, null, React.createElement(DialogContentText, null, endedProps.content)), React.createElement(DialogActions, null, React.createElement(Button, _extends({
        color: "primary"
      }, endedProps.actionButtonProps))));
    }

    return React.createElement(Dialog, {
      open: open
    }, React.createElement(LinearProgress, {
      variant: "determinate",
      value: progress,
      color: color
    }), React.createElement(DialogTitle, null, informProps.title), React.createElement(DialogContent, null, React.createElement(DialogContentText, null, informProps.content), remaining && React.createElement(DialogContentText, null, "Remaining: ", format(new Date(remaining * 1000), 'mm:ss'))), React.createElement(DialogActions, null, React.createElement(Button, _extends({
      color: "primary"
    }, informProps.actionButtonProps))));
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