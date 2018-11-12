import PropTypes from 'prop-types';
import React from 'react';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Collapse } from 'react-bootstrap';
import { filter, isEmpty, extend, forEach, find } from 'lodash';
import styled from 'styled-components';
import ChapterSection from './task-plan/chapter-section';
import BrowseTheBook from './buttons/browse-the-book';
import TriStateCheckbox from './tri-state-checkbox';
import cn from 'classnames';
import Loading from './loading-screen';
import BookModel from '../models/reference-book';
import ChapterModel from '../models/reference-book/chapter';
import PageModel from '../models/reference-book/page';

const SectionWrapper = styled.div`
  display: flex;
  height: 2.5rem;
  align-items: center;
  margin-left: 0.5rem;
  cursor: pointer;
  font-size: 1.5rem;
  > * { margin-left: 1rem; }
  input { font-size: 1.7rem; margin-left: 1.2rem; }
  border-bottom: ${props => props.theme.borders.box};
`;

@observer
class Section extends React.Component {
  static propTypes = {
    section: PropTypes.instanceOf(PageModel).isRequired,
    selections: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  isSelected = () => { return !!this.props.selections[this.props.section.id]; };

  @action.bound toggleSection() {
    this.props.onChange({ [this.props.section.id]: !this.isSelected() });
  }

  render() {
    const { section } = this.props;
    const classNames = cn('section', { selected: this.isSelected() });
    return (
      <SectionWrapper
        className={classNames}
        data-section-id={section.id}
        onClick={this.toggleSection}
      >
        <span className="section-checkbox">
          <input type="checkbox" readOnly={true} checked={this.isSelected()} />
        </span>
        <ChapterSection section={section.chapter_section.asString} />
        <span className="section-title"> {section.title}</span>
      </SectionWrapper>
    );
  }
}

const ChapterHeading = styled.div`
  display: flex;
  height: 3.5rem;
  align-items: center;
  cursor: pointer;
  font-size: 1.7rem;
  border-bottom: ${props => props.theme.borders.box};
  > * {
  margin-left: 1rem;
  }
  .chapter-title {
  flex: 1;
  }
`;

const ChapterWrapper = styled.div`

`;

@observer
class ChapterAccordion extends React.Component {
  static propTypes = {
    book: PropTypes.instanceOf(BookModel).isRequired,
    chapter: PropTypes.instanceOf(ChapterModel).isRequired,
    onChange: PropTypes.func.isRequired,
    selections: PropTypes.object.isRequired,
  };

  @computed get isAnySelected() {
    return !!find(this.props.chapter.children, this.isSectionSelected);
  }

  @observable expanded = this.isAnySelected || '1' === this.props.chapter.chapter_section.asString;

  browseBook = (ev) => { return ev.stopPropagation(); }; // stop click from toggling the accordian

  isSectionSelected = (section) => { return this.props.selections[section.id]; };

  toggleSectionSelections = (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    const selected = !this.isAnySelected;
    const newSelections = {};
    this.props.chapter.children.forEach(pg => newSelections[pg.id] = selected);
    this.expanded = true;
    this.props.onChange(newSelections);
  };

  //   renderHeader = () => {
  //     const { chapter } = this.props;
  //
  //     return (
  //
  //     );
  //   };

  @action.bound onAccordianToggle() {
    this.expanded = !this.expanded;
  }

  render() {
    const { chapter } = this.props;
    const selected = filter(chapter.children, this.isSectionSelected);

    const checkBoxType = selected.length === chapter.children.length ? 'checked'
      : selected.length ? 'partial' : 'unchecked';

    //const classNames = ;

    return (
      <ChapterWrapper className="chapter"
        data-is-expanded={this.expanded}
      >
        <ChapterHeading
          role="button"
          data-chapter-section={chapter.chapter_section.chapter}
          onClick={this.onAccordianToggle}
        >
          <span className="chapter-checkbox">
            <TriStateCheckbox type={checkBoxType} onClick={this.toggleSectionSelections} />
          </span>
          <span className="chapter-number">
            Chapter <ChapterSection section={chapter.chapter_section.asString} /> - </span>
          <span className="chapter-title"> {chapter.title} </span>
          <BrowseTheBook
            unstyled
            tag="div"
            onClick={this.browseBook}
            chapterSection={chapter.chapter_section.asString}
            book={this.props.book}
          >
            Browse this Chapter
          </BrowseTheBook>
        </ChapterHeading>
        <Collapse in={this.expanded}>
          <div className="sections">
            {chapter.children.map((section) =>
              <Section key={section.cnx_id} {...this.props} section={section} />)}
          </div>
        </Collapse>
      </ChapterWrapper>
    );
  }
}

const SectionChooserWrapper = styled.div`
  border: ${props => props.theme.borders.box};
  border-radius: 4px;
`;

export default
@observer
class SectionsChooser extends React.Component {

  static propTypes = {
    book: PropTypes.instanceOf(BookModel).isRequired,
    onSelectionChange: PropTypes.func,
    selectedPageIds: PropTypes.arrayOf(
      PropTypes.string
    ),
  };

  @observable selections = {};

  componentWillMount() {
    this.props.book.ensureLoaded();

    this.copySelectionStateFrom(
      this.props.selectedPageIds ? this.props.selectedPageIds : []
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedPageIds) {
      this.copySelectionStateFrom(nextProps.selectedPageIds);
    }
  }

  @action.bound copySelectionStateFrom = (pageIds) => {
    const selections = {};
    pageIds.forEach(pgId => selections[pgId] = true);
    this.selections = selections;
  }

  getSelectedSectionIds = (selections = this.selections) => {
    const ids = [];
    forEach(selections, (isSelected, id) => {
      if (isSelected) { ids.push(id); }
    });
    return ids;
  }

  @action.bound onSectionSelectionChange(update) {
    this.selections = extend({}, this.selections, update);
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(this.getSelectedSectionIds(this.selections));
    }
  }

  render() {
    const { book } = this.props;

    if (book.api.isPending) {
      return <Loading />;
    }

    return (
      <SectionChooserWrapper>
        {book.children.map((chapter) =>
          <ChapterAccordion
            key={chapter.id}
            {...this.props}
            onChange={this.onSectionSelectionChange}
            selections={this.selections}
            chapter={chapter}
          />)}
      </SectionChooserWrapper>
    );
  }
};
