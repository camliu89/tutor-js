import PropTypes from 'prop-types';
import React from 'react';
import { observer } from 'mobx-react';
import { observable, action, computed } from 'mobx';
import { Form } from 'react-bootstrap';
import { autobind } from 'core-decorators';
import { ArbitraryHtmlAndMath } from 'shared';
import Courses from '../../models/courses-map';
import Note from '../../models/notes/note';
import { Icon } from 'shared';
import SuretyGuard from 'shared/components/surety-guard';

@observer
class EditBox extends React.Component {

  static propTypes = {
    text: PropTypes.string.isRequired,
    dismiss: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
  };

  @observable text = this.props.text;

  @action.bound onUpdate(ev) {
    this.text = ev.target.value;
  }

  renderWarning() {
    if (this.text.length > Note.MAX_TEXT_LENGTH) {
      return <Form.Label variant="danger">Text cannot be longer than {Note.MAX_TEXT_LENGTH} characters</Form.Label>;
    }
    return null;
  }

  @autobind
  callUpdateText() {
    this.props.save(this.text);
    this.props.dismiss();
  }

  render() {
    const { text, props: { dismiss } } = this;
    return (
      <div className="edit-box">
        <textarea autoFocus ref="textarea" onChange={this.onUpdate} value={text}></textarea>
        {this.renderWarning()}
        <div className="button-group">
          <button title="Save" onClick={this.callUpdateText}><Icon type="check" /></button>
          <button title="Cancel editing" variant="default" onClick={dismiss}><Icon type="close" /></button>
        </div>
      </div>
    );
  }
}


export default
@observer
class NoteCard extends React.Component {

  static propTypes = {
    onDelete: PropTypes.func.isRequired,
    note: PropTypes.instanceOf(Note).isRequired,
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
  saveNote(newText) {
    this.props.note.text = newText;
    this.props.note.save();
  }

  @action.bound doDelete() {
    this.props.note.destroy().then(
      this.props.onDelete
    );
  }

  @computed get course() {
    return Courses.get(this.props.note.courseId);
  }

  @autobind
  openPage() {
    const { id, chapter, section } = this.props.note;
    let url = `/book/${this.course.ecosystem_id}/section/${chapter}`;
    if (section) {
      url += `.${section}`;
    }
    url += `?highlight=${id}`;
    window.open(url, '_blank');
  }

  render() {
    const { note } = this.props;
    return (
      <div className="note-card">
        <div className="note-body">
          <div className="note-content">
            <blockquote className="selected-text">
              <ArbitraryHtmlAndMath html={this.props.note.content} />
            </blockquote>
            {this.editing ? (
              <EditBox
                text={note.text}
                dismiss={this.stopEditing}
                save={this.saveNote}
              />
            ) : (
              <div className="plain-text">
                {note.text}
              </div>
            )}
          </div>
          <div className="controls">
            {!this.editing && <button title="Edit" onClick={this.startEditing}><Icon type="edit" /></button>}

            <button title="View in book" onClick={this.openPage}><Icon type="external-link-alt" /></button>
            <SuretyGuard
              title="Are you sure you want to delete this note?"
              message="If you delete this note, your work cannot be recovered."
              okButtonLabel="Delete"
              onConfirm={this.doDelete}
            >
              <button title="Delete"><Icon type="trash" /></button>
            </SuretyGuard>
          </div>
        </div>
      </div>
    );
  }
};
