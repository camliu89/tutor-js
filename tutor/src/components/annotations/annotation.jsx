import React from 'react';
import { observer } from 'mobx-react';
import { observable, action, computed, when } from 'mobx';
import { autobind } from 'core-decorators';
import serializeSelection from 'serialize-selection';
import cn from 'classnames';
import './highlighter';
import User from '../../models/user';
import { debounce, filter, defer, sortBy, flatMap } from 'lodash';
import Icon from '../icon';
import SummaryPage from './summary-page';
import DOM from '../../helpers/dom';
import imagesComplete from '../../helpers/images-complete';
import { Logging } from 'shared';
import Courses from '../../models/courses-map';
import EditBox from './edit-box';
import SidebarButtons from './sidebar-buttons';
import InlineControls from './inline-controls';
import WindowShade from './window-shade';

const highlighter = new TextHighlighter(document.body);

const ERROR_DISPLAY_TIMEOUT = 1000 * 2;

function getSelectionRect(win, selection) {
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const wLeft = win.pageXOffset;
  const wTop = win.pageYOffset;

  return {
    bottom: rect.bottom + wTop,
    top: rect.top + wTop,
    left: rect.left + wLeft,
    right: rect.right + wLeft,
  };
}

function scrollToSelection(win, selection) {
  const sRect = getSelectionRect(win, selection);
  const marginTop = (win.innerHeight - sRect.bottom + sRect.top) / 2;
  const startPos = win.pageYOffset;
  const startTime = Date.now();
  const endPos = sRect.top - marginTop;

  const duration = 400; // milliseconds
  // Formulas lifted from ScrollToMixin, which I can't use here
  const EASE_IN_OUT = (t) => (
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  );
  const POSITION = (start, end, elapsed, duration) => (
    elapsed > duration ? end : start + (end - start) * EASE_IN_OUT(elapsed / duration)
  );

  const step = () => {
    const elapsed = Date.now() - startTime;
    win.scrollTo(0, POSITION(startPos, endPos, elapsed, duration));
    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  };

  step();
}


@observer
export default class AnnotationWidget extends React.Component {

  static propTypes = {
    courseId: React.PropTypes.string.isRequired,
    documentId: React.PropTypes.string.isRequired,
    windowImpl: React.PropTypes.shape({
      open: React.PropTypes.func,
    }),
    pageType: React.PropTypes.string,
    title: React.PropTypes.string,
  };

  static defaultProps = {
    windowImpl: window,
    pageType: 'reading',
  };


  @observable activeAnnotation = null;
  @observable widgetStyle = null;
  @observable scrollToPendingAnnotation;
  @computed get showWindowShade() {
    return this.ux.isSummaryVisible;
  }
  @observable canRenderSidebarButtons = false;
  @observable parentRect = {};
  @observable referenceElements = [];

  @computed get course() {
    return Courses.get(this.props.courseId);
  }

  @computed get annotationsForThisPage() {
    return this.allAnnotationsForThisBook.filter(item =>
      (item.selection.chapter === this.props.chapter) &&
      (item.selection.section === this.props.section) &&
      this.referenceElements.find((el) => el.id === item.selection.elementId)
    );
  }

  @computed get allAnnotationsForThisBook() {
    return filter(User.annotations.array, { courseId: this.props.courseId });
  }

  setupPendingHighlightScroll(windowHash) {
    const highlightMatch = windowHash.match(/highlight-(.*)/);
    if (!highlightMatch) { return; }
    this.scrollToPendingAnnotation = () => {
      const id = highlightMatch[1];
      const annotation = User.annotations.get(id);
      if (annotation) {
        const selection = annotation.selection.restore();
        scrollToSelection(this.props.windowImpl, selection);
      } else {
        Logging.error(`Page attempted to scroll to annotation id '${id}' but it was not found`);
      }
      this.scrollToPendingAnnotation = null;
    };
  }

  handleSelectionChange = debounce((ev) => {
    if (this.activeAnnotation) {
      if (!DOM.closest(
        document.getSelection().baseNode, '.slide-out-edit-box')
      ) {
        this.activeAnnotation = null;
      }

    } else {
      this.setWidgetStyle();
    }
  }, 1);

  componentDidMount() {
    if (!this.course.canAnnotate) { return; }

    if (this.props.windowImpl.location.hash) {
      this.setupPendingHighlightScroll(this.props.windowImpl.location.hash);
    }

    when(
      () => !User.annotations.api.isPending,
      () => {
        this.initializePage().then(() => {
          defer(() => { // defer so that pending selections are complete
            this.props.windowImpl.document.addEventListener(
              'selectionchange', this.handleSelectionChange
            );
          });
        });
      },
    );
  }

  componentWillReceiveProps(nextProps) {
    if (!this.course.canAnnotate) { return; }

    if (nextProps.documentId !== this.props.documentId) {
      this.canRenderSidebarButtons = false;
      //      this.widgetStyle = null;
      this.activeAnnotation = null;
      this.initializePage();
    }
  }

  componentWillUnmount() {
    this.props.windowImpl.document.removeEventListener('selectionchange', this.handleSelectionChange);
  }

  initializePage() {
    this.ux.statusMessage.show({
      type: 'info',
      message: 'Waiting for page to finish loading…',
    });

    this.getReferenceElements();
    return imagesComplete(
      this.props.windowImpl.document.querySelector('.book-content')
    ).then(() => {
      this.annotationsForThisPage.forEach((annotation) => {
        annotation.selection.restore(highlighter);
      });
      this.canRenderSidebarButtons = true;
      if (this.scrollToPendingAnnotation) {
        this.scrollToPendingAnnotation();
      }
      this.ux.statusMessage.hide();
    });
  }

  @action.bound
  highlightEntry(entry) {
    const selection = entry.selection.restore();
    if (selection) {
      const rect = getSelectionRect(this.props.windowImpl, selection);
      entry.style = {
        top: rect.top - this.parentRect.top,
        position: 'absolute',
      };
      highlighter.doHighlight();
    }
  }

  saveSelectionWithReferenceId() {
    let selection;
    for (const re of this.referenceElements) {
      selection = serializeSelection.save(re);
      if (selection.start >= 0) {
        selection.elementId = re.id;
        return selection;
      }
    }
    return null;
  }

  cantHighlightReason() {
    // Is it a selectable area?
    if (!this.saveSelectionWithReferenceId()) {
      return 'Only content can be highlighted';
    }
    // Is it free from overlaps with other selections?
    // Compare by using the same reference node
    const selection = document.getSelection().anchorNode;
    for (const annotation of this.annotationsForThisPage) {
      if (annotation.isSiblingOfElement(selection)) {
        const sel = annotation.selection;
        const ss = serializeSelection.save(annotation.referenceElement);
        const { start, end } = ss;
        if ((start >= 0 && sel.start >= start && sel.start <= end) || (sel.end >= start && sel.end <= end)) {
          return 'Highlights cannot overlap one another';
        }
      }
    }
    return null;
  }


  @action.bound
  setWidgetStyle() {
    const selection = this.props.windowImpl.getSelection();

    // If it's a cursor placement with no highlighted text, check
    // for whether it's in an existing highlight
    if (selection.isCollapsed) {
      this.widgetStyle = null;
      this.savedSelection = null;
      const referenceEl = DOM.closest(selection.baseNode, '[id]');
      const { start } = serializeSelection.save(referenceEl);

      this.activeAnnotation = this.annotationsForThisPage.find((entry) => {
        if (entry.isSiblingOfElement(referenceEl)) {
          const sel = entry.selection;
          return sel.start <= start && sel.end >= start;
        }
      });
      this.ux.statusMessage.hide();
    } else {
      const errorMessage = this.cantHighlightReason();
      if (errorMessage) {
        this.savedSelection = null;
        this.ux.statusMessage.show({ message: errorMessage, autoHide: true });
        this.widgetStyle = null;
      } else {
        this.savedSelection = this.saveSelectionWithReferenceId();
        const rect = getSelectionRect(this.props.windowImpl, selection);
        const pwRect = this.parentRect;
        this.ux.statusMessage.hide();
        const middle = (rect.bottom - rect.top) / 2;
        const center = (rect.right - rect.left) / 2;
        this.widgetStyle = {
          top: `${rect.bottom - middle - pwRect.top}px`,
          left: `${(rect.left + center) - pwRect.left}px`,
        };
      }
    }
  }

  @action
  getReferenceElements() {
    this.referenceElements = Array.from(
      this.articleElement.querySelectorAll('.book-content > [id]')
    ).reverse();

  }

  @autobind
  highlightAndClose() {
    return this.saveNewHighlight().then(
      action((response) => {
        this.widgetStyle = null;
        this.highlightEntry(response);
        return response;
      }));
  }

  @autobind
  openAnnotator() {
    return this.highlightAndClose()
      .then((response) => {
        this.activeAnnotation = response;
      });
  }

  @autobind
  saveNewHighlight() {
    return User.annotations.create({
      documentId: this.props.documentId,
      selection: this.savedSelection,
      courseId: this.props.courseId,
      chapter: this.props.chapter,
      section: this.props.section,
      title: this.props.title,
    });
  }

  @computed get sortedAnnotationsForPage() {
    return flatMap(sortBy(this.referenceElements, 'offsetTop'), (el) => (
      sortBy(
        filter(this.annotationsForThisPage, { elementId: el.id }),
        'selection.start'
      )
    ));
  }

  @computed get nextAnnotation() {
    if (!this.activeAnnotation) { return null; }
    const { start } = this.activeAnnotation.selection;
    return this.sortedAnnotationsForPage.find((hl) =>
      hl.selection.start > start
    );
  }

  @computed get previousAnnotation() {
    if (!this.activeAnnotation) { return null; }
    const { start } = this.activeAnnotation.selection;
    return this.sortedAnnotationsForPage.find((hl) =>
      hl.selection.start < start
    );
  }

  @action.bound
  getParentRect(el) {
    if (el) {
      const wLeft = this.props.windowImpl.pageXOffset;
      const wTop = this.props.windowImpl.pageYOffset;
      const parentRect = el.parentNode.getBoundingClientRect();
      this.parentRect = {
        bottom: wTop + parentRect.bottom,
        left: wLeft + parentRect.left,
        right: wLeft + parentRect.right,
        top: wTop + parentRect.top,
      };
      this.articleElement = el.parentNode;
    }
  }

  @computed get ux() { return User.annotations.ux; }

  @action.bound seeAll() {
    this.ux.isSummaryVisible = true;
    this.activeAnnotation = null;
  }

  @action.bound hideActiveHighlight() {
    if (this.activeAnnotation.isDeleted) {
      this.onAnnotationDelete(this.activeAnnotation);
    }
    this.activeAnnotation = null;
  }

  @action.bound onAnnotationDelete(annotation) {
    const selection = annotation.selection.restore();
    highlighter.removeHighlights(selection.baseNode.parentElement);
  }

  @action.bound editAnnotation(annotation) {
    this.activeAnnotation = annotation;
  }


  renderStatusMessage() {
    if (!this.ux.statusMessage.display) { return null; }

    return (
      <div
        className={cn('status-message-toast', this.ux.statusMessage.type)}
      >
        <Icon type={this.ux.statusMessage.icon} /> {this.ux.statusMessage.message}
      </div>
    );
  }

  render() {
    if (!this.course.canAnnotate) { return null; }

    return (
      <div className="annotater" ref={this.getParentRect}>
        <InlineControls
          style={this.widgetStyle}
          annotate={this.openAnnotator}
          highlight={this.highlightAndClose}
        />
        <EditBox
          annotation={this.activeAnnotation}
          onHide={this.hideActiveHighlight}
          goToAnnotation={this.editAnnotation}

          next={this.nextAnnotation}
          previous={this.previousAnnotation}
          seeAll={this.seeAll}
        />
        <SidebarButtons
          disabled={!this.canRenderSidebarButtons}
          annotations={this.annotationsForThisPage}
          parentRect={this.parentRect}
          onClick={this.editAnnotation}
          activeAnnotation={this.activeAnnotation}
        />
        {this.renderStatusMessage()}
        <WindowShade show={this.showWindowShade}>
          <SummaryPage
            annotations={this.allAnnotationsForThisBook}
            onDelete={this.onAnnotationDelete}
            currentChapter={this.props.chapter}
          />
        </WindowShade>
      </div>
    );
  }

}
