import { action, observable, computed } from 'mobx';
import { sortBy, values } from 'lodash';
import {
  BaseModel, identifiedBy, hasMany, session, identifier,
} from 'shared/model';
import ChapterSection from './chapter-section';
import Map from 'shared/model/map';
import Note from './notes/note';

class PageNotes extends Map {
  keyType = Number

  static Model = Note

  constructor({ page, notes }) {
    super();
    this.notes = notes;
    this.page = page;
    this.fetch();
  }

  @computed get uuid() {
    return this.page.uuid;
  }

  @computed get byPagePosition() {
    return sortBy(this.array, 'pageTopPosition');
  }

  fetch() {
    return { pageUuid: this.page.uuid };
  }

  @action onLoaded({ data: notes }) {
    this.mergeModelData(notes);
  }

  @action onNoteDeleted(note) {
    this.delete(note.id);
    this.notes.onNoteDeleted(note, this);
  }

  async create({ anchor, page, ...attrs }) {
    const note = new Note({
      anchor,
      chapter_section: page.chapter_section,
      page_id: page.id,
      contents: attrs,
    }, this);
    await note.save();
    if (!this.notes.summary.forPage(page)) {
      this.notes.summary.push(page);
    }
    return note;
  }

}

@identifiedBy('notes/highlighted-section')
class HighlightedSection extends BaseModel {

  @identifier uuid;
  @session title;
  @session({ model: ChapterSection }) chapter_section;

}

@identifiedBy('notes')
class Notes extends BaseModel {

  pages = observable.map();

  @hasMany({ model: HighlightedSection, extend: {
    sorted() { return sortBy(this, 'chapter_section.asNumber'); },
    forPage(page) {
      return this.find(s => s.uuid == page.uuid);
    },
  } }) summary;


  constructor({ course }) {
    super();
    this.course = course;
    this.fetchHighlightedPages();
  }

  hasNotesForPage(page) {
    return Boolean(this.pages.get(page.uuid));
  }

  @computed get isAnyPagePending() {
    return Boolean(Array.from(this.pages.values()).find(pg => pg.api.isPending));
  }

  @action forPage(page) {
    return this.pages.get(page.uuid);
  }

  @action ensurePageExists(page) {
    if (!this.hasNotesForPage(page)) {
      const notes = new PageNotes({ page, notes: this });
      this.pages.set(page.uuid, notes);
    }
    return this.forPage(page);
  }

  fetchHighlightedPages() {
    return { bookUuid: this.course.ecosystem_book_uuid };
  }

  onHighlightedPagesLoaded({ data: { pages } }) {
    const summary = {};
    pages.forEach(pg => {
      const key = pg.uuid;
      if (!summary[key]) { summary[key] = pg; }
    });
    this.summary = values(summary);
  }

  @action onNoteDeleted(note, page) {
    if (page.isEmpty) {
      this.summary.remove(this.summary.find(s => s.uuid == page.uuid));
    }
  }

}

export { Note, Notes, PageNotes };
