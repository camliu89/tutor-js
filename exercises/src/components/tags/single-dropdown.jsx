import PropTypes from 'prop-types';
import React from 'react';
import { get, map }  from 'lodash';
import Exercise from '../../models/exercises/exercise';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import Wrapper from './wrapper';

@observer
class SingleDropdown extends React.Component {
  static propTypes = {
    exercise: PropTypes.instanceOf(Exercise).isRequired,
    label:   PropTypes.string.isRequired,
    type:  PropTypes.string.isRequired,
  };

  @action.bound updateTag(ev) {
    const tag = this.props.exercise.tags.findOrAddWithType(this.props.type);
    tag.value = ev.target.value;
  }

  render() {
    const tag = this.props.exercise.tags.withType(this.props.type);

    return (
      <Wrapper label={this.props.label} singleTag={true}>
        <div className="tag">
          <select className="form-control" onChange={this.updateTag} value={get(tag, 'value', '')}>
            {!tag && <option key="blank" value="" />}
            {map(this.props.choices, (name, tag) => (
              <option key={tag} value={tag}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </Wrapper>
    );
  }
}

export default SingleDropdown;
