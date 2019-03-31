import { React, PropTypes, styled } from '../helpers/react';
import { isEmpty } from 'lodash';
import Course from '../models/course';
import ChapterSection from './chapter-section';
import RelatedContent from '../models/related-content';
import BrowseTheBook from './buttons/browse-the-book';

const Title = styled.span`
  margin-left: 0.5rem;
`;

const RelatedContentLink = ({ course, content }) => {

  if (isEmpty(content)) { return null; }

  return (
    <div className="related-content-link">
      <span className="preamble">
        {'Comes from '}
      </span>
      {content.map((rl, i) => (
        <BrowseTheBook
          key={i}
          unstyled={true}
          chapterSection={rl.chapter_section.asString}
          course={course}
          tabIndex={-1}
        >
          <span className="part">
            <ChapterSection chapterSection={rl.chapter_section} />
            <Title>{rl.title}</Title>
          </span>
        </BrowseTheBook>))}
    </div>
  );
};

RelatedContentLink.propTypes = {
  course: PropTypes.instanceOf(Course).isRequired,
  content: PropTypes.arrayOf(
    PropTypes.instanceOf(RelatedContent).isRequired,
  ).isRequired,
};

export default RelatedContentLink;
