import { React, PropTypes, cn, styled, observer } from 'vendor';
import { colors } from 'theme';
import Question from 'shared/components/question';

const HomeworkQuestionsWrapper = styled.div`

`;

const QuestionPreview = styled.div`
  border: 1px solid ${colors.neutral.lighter};
  margin: 2rem;
  &:first-of-type {
   .ox-icon-arrow-up { display: none; }
  }
  &:last-of-type {
   .ox-icon-arrow-down { display: none; }
  }
`;


const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${colors.neutral.lighter}
  padding: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const ExerciseNumber = styled.div`
  font-size: 1.5rem;
`;


const ReviewExerciseCard = observer(({
  index, info,
  controlsComponent: Controls,
  questionType = 'teacher-preview',
}) => (
  <QuestionPreview className="openstax-exercise-preview">
    <Header>
      <ExerciseNumber>
        Question {index + 1}
      </ExerciseNumber>
      <Controls info={info} />
    </Header>
    <div className="card-body">
      <Question
        className="openstax-question-preview"
        question={info.question}
        hideAnswers={false}
        choicesEnabled={false}
        displayFormats={false}
        type={questionType}
      />
    </div>
  </QuestionPreview>
));
ReviewExerciseCard.dislayName = 'ReviewExerciseCard';
ReviewExerciseCard.propTypes = {
  controlsComponent: PropTypes.func.isRequired,
};

const HomeworkQuestions = observer(({ questionsInfo, questionType, className, controlsComponent }) => (
  <HomeworkQuestionsWrapper className={cn('homework-questions', className)}>
    {questionsInfo.map((info, index) => (
      <ReviewExerciseCard
        info={info}
        index={index}
        questionType={questionType}
        key={info.key}
        controlsComponent={controlsComponent}
      />
    ))}
  </HomeworkQuestionsWrapper>
));

HomeworkQuestions.displayName = 'HomeworkQuestions';
HomeworkQuestions.propTypes = {
  controlsComponent: PropTypes.func.isRequired,
  questionType: PropTypes.string,
  questionsInfo: PropTypes.array.isRequired,
};
export default HomeworkQuestions;