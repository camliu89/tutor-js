import React from 'react';
import { observer } from 'mobx-react';
import cn from 'classnames';
import { get } from 'lodash';
import './highlighter';
import Icon from '../icon';
import Annotation from '../../models/annotations/annotation';

@observer
export default class SidebarButtons extends React.Component {
  static propTypes = {
    annotations: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(Annotation)
    ).isRequired,
    parentRect: React.PropTypes.shape({
      top: React.PropTypes.number,
    }),
    onClick: React.PropTypes.func.isRequired,
    activeAnnotation: React.PropTypes.instanceOf(Annotation),
  }

  render() {
    const {
      annotations, parentRect, onClick, activeAnnotation,
    } = this.props;

    return (
      <div className="annotation-edit-buttons">
        {annotations.map(note => (
          note.text.length ?
            <Icon type="comment"
              key={note.id}
              className={
                cn('sidebar-button', { active: note === activeAnnotation })
              }
              style={{
                top: get(note.selection, 'bounds.top', 0) - parentRect.top,
              }}
              alt="View annotation"
              onClick={() => onClick(note)}
            /> : null
        ))}
      </div>
    );
  }

}