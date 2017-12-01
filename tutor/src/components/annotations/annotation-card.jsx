import React from 'react';
import { observer } from 'mobx-react';
import { observable, action, computed } from 'mobx';
import { autobind } from 'core-decorators';
import Annotation from '../../models/annotations/annotation';
import Icon from '../icon';
import SuretyGuard from 'shared/src/components/surety-guard';

@observer
class EditBox extends React.Component {

  static propTypes = {
    text: React.PropTypes.string.isRequired,
    dismiss: React.PropTypes.func.isRequired,
    save: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
  };

  @autobind
  callUpdateText() {
    this.props.save(this.refs.textarea.value);
    this.props.dismiss();
  }

  render() {
    const { show, text, dismiss } = this.props;
    return show ? (
      <div className="edit-box">
        <textarea ref="textarea" defaultValue={text}></textarea>
        <button onClick={this.callUpdateText}><Icon type="check" /></button>
        <button onClick={dismiss}><Icon type="times" /></button>
      </div>
    ) : (
      <div className="plain-text">
        {text}
      </div>
    );
  }
}

@observer
export default class AnnotationCard extends React.Component {

  static propTypes = {
    onDelete: React.PropTypes.func.isRequired,
    annotation: React.PropTypes.instanceOf(Annotation).isRequired,
  };

  @observable editing = false;

  @action.bound
  startEditing() {
    this.editing = true;
  }

  @action.bound
  stopEditing() {
    this.editing = false;
  }

  @action.bound
  saveAnnotation(newText) {
    this.props.annotation.text = newText;
    this.props.annotation.save();
  }

  @action.bound doDelete() {
    this.props.annotation.destroy().then(
      this.props.onDelete
    );
  }

  @autobind
  openPage() {
    const { id, selection: { courseId, chapter, section } } = this.props.annotation;
    let url = `/books/${courseId}/section/${chapter}`;
    if (section) {
      url += `.${section}`;
    }
    url += `#highlight-${id}`;
    window.open(url, '_blank');
  }

  render() {
    const { annotation } = this.props;

    return (
      <div className="annotation-card">
        <div className="annotation-content">
          <div className="selected-text">
            {annotation.selection.content}
          </div>
          <EditBox
            show={this.editing}
            text={annotation.text}
            dismiss={this.stopEditing}
            save={this.saveAnnotation}
          />
        </div>
        <div className="controls">
          <button onClick={this.startEditing}><Icon type="edit" /></button>
          <button onClick={this.openPage}><Icon type="external-link" /></button>
          <SuretyGuard
            title="Are you sure you want to delete this note?"
            message="If you delete this note, your work cannot be recovered."
            okButtonLabel="Delete"
            onConfirm={this.doDelete}
          >
            <button><Icon type="trash" /></button>
          </SuretyGuard>
        </div>
      </div>
    );
  }
}
