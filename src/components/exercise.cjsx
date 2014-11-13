_ = require 'underscore'
React = require 'react'
katex = require 'katex'
{AnswerActions, AnswerStore} = require '../flux/answer'


# Converts an index to `a-z` for question answers
AnswerLabeler = React.createClass
  displayName: 'AnswerLabeler'
  render: ->
    {index, before, after} = @props
    letter = String.fromCharCode(index + 97) # For uppercase use 65
    <span className='answer-char'>{before}{letter}{after}</span>


ArbitraryHtmlAndMath = React.createClass
  displayName: 'ArbitraryHtmlAndMath'
  render: ->
    classes = ['arbitrary-html-and-math']
    classes.push(@props.className) if @props.className

    if @props.block
      <div className={classes.join(' ')} dangerouslySetInnerHTML={__html:@props.html} />
    else
      <span className={classes.join(' ')} dangerouslySetInnerHTML={__html:@props.html} />

  renderMath: ->
    for node in @getDOMNode().querySelectorAll('[data-math]:not(.loaded)')
      $node = $(node)
      formula = $node.attr('data-math')

      # Divs with data-math should be rendered as a block
      isBlock = node.tagName.toLowerCase() in ['div']

      if isBlock
        formula = "\\displaystyle {#{formula}}"

      katex.render(formula, $node[0])
      $node.addClass('loaded')

  componentDidMount:  -> @renderMath()
  componentDidUpdate: -> @renderMath()


Question =
  # renderBody: ->
  # renderStem: ->
  render: ->
    {config} = @props
    isAnswered = !!config.answer

    if config.stimulus?
      stimulus = <ArbitraryHtmlAndMath block=true className='stimulus' html={config.stimulus} />
    classes = ['question', config.type]
    classes.push('answered') if isAnswered

    if @renderStem?
      stem = @renderStem()
    else
      stem = <ArbitraryHtmlAndMath block=true className='stem' html={config.stem} />

    <div className={classes.join(' ')} data-format={config.type}>
      {stimulus}
      {stem}
      {@renderBody()}
    </div>


BlankQuestion = React.createClass
  displayName: 'BlankQuestion'
  mixins: [Question]
  renderStem: ->
    {config} = @props
    {stem} = config
    isAnswered = !!config.answer

    if isAnswered
      # TODO: Make sure HTML is escaped!!!
      if config.answer is config.correct
        stem = stem.replace(/____/, "<span class='correct'>#{config.answer}</span>")
      else
        stem = stem.replace(/____/, "<span class='incorrect'>#{config.answer}</span><span class='missed'>#{config.correct}</span>")
    else
      stem = stem.replace(/____/, '<input type="text" placeholder="fill this in" class="blank"/>')

    <ArbitraryHtmlAndMath block=true className='stem' html={stem} />

  componentDidMount: ->
    # Find the input box and attach listeners to it
    input = @getDOMNode().querySelector('.blank')
    input?.onkeyup = input?.onblur = input?.onchange = =>
      if input.value
        AnswerActions.setAnswer(@props.config, input.value)
      else
        AnswerActions.setAnswer(@props.config, undefined)


SimpleQuestion = React.createClass
  displayName: 'SimpleQuestion'
  mixins: [Question]
  renderBody: ->
    {config} = @props
    isAnswered = !!config.answer
    answer = AnswerStore.getAnswer(config)

    if isAnswered
      <div className='answer'>Your answer: <strong>{answer}</strong></div>
    else
      <input type='text' placeholder={config.short_stem} ref='prompt' onChange=@onChange value={answer or ''}/>

  onChange: ->
    val = @refs.prompt.getDOMNode().value
    if val
      AnswerActions.setAnswer(@props.config, val)
    else
      AnswerActions.setAnswer(@props.config, undefined)


SimpleMultipleChoiceOption = React.createClass
  displayName: 'SimpleMultipleChoiceOption'
  render: ->
    {config, questionId, index} = @props
    id = config.id
    <ArbitraryHtmlAndMath className='stem' html={config.content or config.value} />

MultiMultipleChoiceOption = React.createClass
  displayName: 'MultiMultipleChoiceOption'
  render: ->
    {config, idIndices} = @props
    vals = []
    for id, i in idIndices
      unless config.value.indexOf(id) < 0
        index = config.value.indexOf(id)
        vals.push <AnswerLabeler key={index} before='(' after=')' index={index}/>
    <span className='multi'>{vals}</span>


MultipleChoiceOptionMixin =
  render: ->
    {inputType, config, questionId, index, isAnswered} = @props

    # For radio boxes there is only 1 value, the id/value but
    # for checkboxes the answer is an array of ids/values
    option = if Array.isArray(config.value)
      @props.idIndices = for id in config.value
        id
      MultiMultipleChoiceOption(@props)
    else
      SimpleMultipleChoiceOption(@props)

    id = "#{questionId}-#{config.id}"

    inputType = 'hidden' if isAnswered

    classes = ['option']
    # null (unanswered), 'correct', 'incorrect', 'missed'
    classes.push(@props.answerState) if @props.answerState

    optionIdent = @props.config.id or @props.config.value
    if Array.isArray(@props.answer)
      isChecked = @props.answer.indexOf(optionIdent) >= 0
    else
      isChecked = @props.answer is optionIdent

    contents = [
      <span key='letter' className='letter'><AnswerLabeler after=')' index={index}/> </span>
      <span key='answer' className='answer'>{option}</span>
    ]


    unless isAnswered
      contents =
        <label>
          <input type={inputType}
            ref='input'
            name={questionId}
            value={JSON.stringify(config.value)}
            onChange=@onChange
            defaultChecked={isChecked}
          />
          {contents}
        </label>

    <li key={id} className={classes.join(' ')}>
      {contents}
    </li>



MultipleChoiceOption = React.createClass
  displayName: 'MultipleChoiceOption'
  getDefaultProps: -> {inputType:'radio'}
  mixins: [MultipleChoiceOptionMixin]

  onChange: ->
    @props.onChange(@props.config)


MultipleChoiceQuestion = React.createClass
  displayName: 'MultipleChoiceQuestion'

  render: ->
    {config} = @props
    isAnswered = !!config.answer

    questionId = config.id
    options = for option, index in config.answers
      answerState = null
      if config.answer is option.id # if my answer is this option
        if config.correct is config.answer
          answerState = 'correct'
        else
          answerState = 'incorrect'
      else if config.correct is option.id and config.answers.length > 2
        answerState = 'missed'

      optionProps = {
        config: option
        answer: AnswerStore.getAnswer(config)
        questionId
        index
        isAnswered
        answerState
        @onChange
      }
      MultipleChoiceOption(optionProps)

    classes = ['question']
    classes.push('answered') if isAnswered

    <div key={questionId} className={classes.join(' ')}>
      <ArbitraryHtmlAndMath block=true className='stem' html={config.stem} />
      <ul className='options'>{options}</ul>
    </div>

  onChange: (answer) ->
    AnswerActions.setAnswer(@props.config, answer.id or answer.value)


MultiSelectOption = React.createClass
  displayName: 'MultiSelectOption'
  getDefaultProps: -> {inputType:'checkbox'}
  mixins: [MultipleChoiceOptionMixin]

  onChange: ->
    # NOTE: @refs.input.state.checked only works for checkboxes (not radio buttons)
    # but @refs.input.getDOMNode().checked works for both
    # and @refs.input.getDOMNode().checked does not work for Node tests ; (
    @props.onChange(@props.config)


# http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
ArrayEquals = (ary1, array) ->
  # if the other array is a falsy value, return
  return false  unless array
  # compare lengths - can save a lot of time
  return false  unless ary1.length is array.length
  i = 0
  l = ary1.length
  while i < l
    # Check if we have nested arrays
    if ary1[i] instanceof Array and array[i] instanceof Array
      # recurse into the nested arrays
      return false  unless ary1[i].equals(array[i])
    # Warning - two different object instances will never be equal: {x:20} != {x:20}
    else return false  unless ary1[i] is array[i]
    i++
  true

MultiSelectQuestion = React.createClass
  displayName: 'MultiSelectQuestion'
  mixins: [Question]
  getInitialState: ->
    answers: []

  renderBody: ->
    {config} = @props
    isAnswered = !!config.answer
    questionId = config.id

    options = []

    for option, index in config.answers
      unless Array.isArray(option.value)
        isCorrect = false
        isIncorrect = false

        if isAnswered and config.correct
          correctAnswers = _.find(config.answers, (a) -> a.id is config.correct).value
          # If correctAnswers is not an array then there is only 1 correct answer
          unless Array.isArray(correctAnswers)
            correctAnswers = [config.correct]

          if config.answer?.indexOf(option.id) >= 0 # if my answer contains this option
            if correctAnswers.indexOf(option.id) >= 0
              answerState = 'correct'
            else
              answerState = 'incorrect'
          else if correctAnswers.indexOf(option.id) >= 0 # This option was missed
            answerState = 'missed'
          else
            answerState = null

        optionProps = {
          config: option
          answer: AnswerStore.getAnswer(config)
          isAnswered
          answerState
          questionId
          index
          @onChange
        }

        options.push MultiSelectOption(optionProps)

    <div key={questionId} className='question-body'>
      <div>Select all that apply:</div>
      <ul className='options'>{options}</ul>
    </div>

  onChange: (answer, isChecked) ->
    i = @state.answers.indexOf(answer.id)
    if i >= 0
      @state.answers.splice(i, 1)
    else
      @state.answers.push(answer.id)

    if @state.answers.length
      AnswerActions.setAnswer(@props.config, @state.answers)
    else
      AnswerActions.setAnswer(@props.config, undefined)


TrueFalseQuestion = React.createClass
  displayName: 'TrueFalseQuestion'
  mixins: [Question]

  renderBody: ->
    {config} = @props
    isAnswered = config.answer?
    questionId = config.id
    idTrue = "#{questionId}-true"
    idFalse = "#{questionId}-false"

    if isAnswered
      trueClasses  = ['option']
      falseClasses = ['option']

      if config.correct
        correctClasses = trueClasses
        incorrectClasses = falseClasses
      else
        correctClasses = falseClasses
        incorrectClasses = trueClasses
      if config.correct is !! config.answer
        correctClasses.push('correct')
      else
        # correctClasses.push('missed') No need to show missed if there are only 2 options
        incorrectClasses.push('incorrect')

      <div className='question-body'>
        <ul className='options'>
          <li className={trueClasses.join(' ')}>
            <span>True</span>
          </li>
          <li className={falseClasses.join(' ')}>
            <span>False</span>
          </li>
        </ul>
      </div>


    else
      <div className='question-body'>
        <ul className='options'>
          <li className='option'>
            <label>
              <input type='radio' name={questionId} value='true' onChange=@onTrue />
              <span>True</span>
            </label>
          </li>
          <li className='option'>
            <label>
              <input type='radio' name={questionId} value='false' onChange=@onFalse />
              <span>False</span>
            </label>
          </li>
        </ul>
      </div>

  onTrue:  -> AnswerActions.setAnswer(@props.config, true)
  onFalse: -> AnswerActions.setAnswer(@props.config, false)


MatchingQuestion = React.createClass
  displayName: 'MatchingQuestion'
  mixins: [Question]

  renderBody: ->
    {config} = @props
    rows = for answer, i in config.answers
      item = config.items[i]

      <tr key={answer.id}>
        <td className='item'>
          <ArbitraryHtmlAndMath className='stem' html={item} />
        </td>
        <td className='spacer'></td>
        <td className='answer'>
          <ArbitraryHtmlAndMath className='stem' html={answer.content or answer.value} />
        </td>
      </tr>

    <table>
      {rows}
    </table>


QUESTION_TYPES =
  'matching'          : MatchingQuestion
  'multiple-choice'   : MultipleChoiceQuestion
  'multiple-select'   : MultiSelectQuestion
  'short-answer'      : SimpleQuestion
  'true-false'        : TrueFalseQuestion
  'fill-in-the-blank' : BlankQuestion

getQuestionType = (format) ->
  QUESTION_TYPES[format] or throw new Error("Unsupported format type '#{format}'")


Exercise = React.createClass
  displayName: 'Exercise'
  render: ->
    {config} = @props

    questions = for questionConfig in config.content.questions
      format = questionConfig.format
      Type = getQuestionType(format)
      props = {config:questionConfig}

      Type(props)


    <div className='exercise'>
      <ArbitraryHtmlAndMath className='stimulus' html={config.content.stimulus} />
      {questions}
    </div>


module.exports = {Exercise, getQuestionType}
