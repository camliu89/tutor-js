import Renderer from 'react-test-renderer';
import { find, map } from 'lodash';
import { MemoryRouter } from 'react-router-dom';
import TagModel from 'shared/model/exercise/tag';
import Factory from '../../factories';

import ExerciseControls from '../../../src/components/exercise/controls';
import Books from '../../../src/components/tags/books';


describe('Book tags component', function() {

  let props;

  beforeEach(() => {
    props = {
      exercise: Factory.exercise({ tags: ['book:stax-phys'] }),
    };
  });


  it('renders tags', () => {
    const books = Renderer.create(<Books {...props} />);
    expect(books.toJSON()).toMatchSnapshot();
    books.unmount();
  });

  it('can make choice', () => {
    const books = mount(<Books {...props} />);
    expect(find(props.exercise.tags, { value: 'stax-econ' })).toBeUndefined();
    books.find('select').simulate('change', { target: { value: 'stax-econ' } });
    expect(find(props.exercise.tags, { value: 'stax-econ' })).not.toBeUndefined();
    books.unmount();
  });

  it('can delete a tag', () => {
    const books = mount(<Books {...props} />);
    expect(props.exercise.tags).toHaveLength(1);
    books.find('.fa-trash').simulate('click');
    expect(props.exercise.tags).toHaveLength(0);
  });

  it('can add a new tag', () => {
    props.exercise.tags = [];
    const books = mount(<Books {...props} />);
    expect(books).not.toHaveRendered('select');
    books.find('.controls .fa-plus-circle').simulate('click');
    expect(books).toHaveRendered('select');
    books.unmount();
  });

});
