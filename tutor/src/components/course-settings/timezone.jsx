import React from 'react';
import { observable, computed, action } from 'mobx';
import { observer } from 'mobx-react';
import { map, values } from 'lodash';
import { Modal, Button } from 'react-bootstrap';

import { AsyncButton } from 'shared';
import { TutorRadio } from '../tutor-input';
import classnames from 'classnames';
import Icon from '../icon';
import moment from 'moment-timezone';
import TimeHelper from '../../helpers/time';
import S from '../../helpers/string';

import Course from '../../models/course';

const timezonePropType = React.PropTypes.oneOf(values(TimeHelper.getTimezones()));

@observer
class TimezonePreview extends React.PureComponent {

  static propTypes = {
    timezone: timezonePropType,
    interval: React.PropTypes.number,
  };

  static defaultProps = {
    time: moment(),
    interval: 60000,
  }

  @observable time = moment();
  @observable timeout;

  componentWillMount() {
    this.update();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  update() {
    const { interval } = this.props;

    this.timeout = setTimeout( () => {
      this.updateTime();
      this.update();
    }, interval);
  }

  updateTime() {
    const { props: { interval } } = this;
    this.time = moment().add(interval, 'ms');
  }

  render() {
    const { time, props: { timezone } } = this;
    const timePreview = time.tz(timezone).format('h:mm a');

    return (
      <span className="timezone-preview">
        {timePreview}
      </span>
    );
  }
}

@observer
class SetTimezoneField extends React.PureComponent {

  static propTypes = {
    courseId: React.PropTypes.string,
    name: React.PropTypes.string.isRequired,
    defaultValue: timezonePropType,
    onChange: React.PropTypes.func.isRequired,
    autofocus: React.PropTypes.bool,
    validate: React.PropTypes.func.isRequired,
  }

  @observable courseTimezone = this.props.defaultValue;

  @action.bound onChange(changeEvent, changeData) {
    const { value } = changeData;
    this.courseTimezone = value;
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    const timezones = TimeHelper.getTimezones();

    const { courseTimezone, props: { name } } = this;

    const timezonesToPick = map(timezones, timezone => {
      const identifier = S.dasherize(timezone);
      return (
        <TutorRadio
          id={identifier}
          key={`timezone-choice-${identifier}`}
          value={timezone}
          name={name}
          checked={timezone === courseTimezone}
          onChange={this.onChange} />
      );
    });

    return (
      <div>
        {timezonesToPick}
        <p className="course-timezone-preview">
          <span className="course-timezone-preview-description">
            Your course time will be:
          </span>
          <strong className="course-timezone-preview-value">
            <TimezonePreview timezone={courseTimezone} />
          </strong>
        </p>
      </div>
    );
  }
}


@observer
export default class SetTimezone extends React.PureComponent {

  static propTypes = {
    course: React.PropTypes.instanceOf(Course).isRequired,
  }


  @observable showModal = false
  @observable invalid = false;
  @observable course_timezone = '';

  @action.bound open() {
    this.showModal = true;
  }
  @action.bound close() {
    this.showModal = false;
  }

  @action.bound validate(timezone) {
    this.invalid = !TimeHelper.isTimezoneValid(timezone);
  }

  performUpdate() {
    if (this.invalid) { return; }
    this.props.course.time_zone = this.course_timezone;
    this.props.course.save().then(this.close);
  }

  renderForm() {
    return (
      <Modal
        show={this.showModal}
        onHide={this.close}
        className="settings-edit-course-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>
            Change Course Timezone
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={classnames({ 'is-invalid-form': this.invalid })}>
          <SetTimezoneField
            name="course-timezone"
            defaultValue={this.props.course.time_zone}
            onChange={val => this.course_timezone = val}
            validate={this.validate}
            autofocus={true} />
        </Modal.Body>
        <Modal.Footer>
          <AsyncButton
            className="-edit-course-confirm"
            onClick={this.performUpdate}
            isWaiting={this.props.course.hasApiRequestPending}
            waitingText="Saving..."
            disabled={this.invalid}
          >
            Save
          </AsyncButton>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    return (
      <Button onClick={this.open} bsStyle="link" className="control edit-course">
        <Icon type="pencil" />
        {this.renderForm()}
      </Button>
    );
  }
}
