import TourStep from '../../../src/models/tour/step';

describe('TourStep Model', () => {

  let step;
  beforeEach(() => {
    step = new TourStep({ id: 1, title: 'a step', body: '# Step heading\n### Subheading' });
  });

  it('can be created from JSON', () => {
    expect(step).toBeInstanceOf(TourStep);
  });

  it('renders markdown', () => {
    expect(step.HTML).toEqual('<h1>Step heading</h1>\n<h3>Subheading</h3>\n');
    step.body = '## <a href="/test">test</a>';
    expect(step.HTML).toEqual('<h2><a href="/test">test</a></h2>\n');
  });

  it('renders best practices', () => {
    step = new TourStep({ id: 1, title: 'a step', body: 'you should :best-practices: take note' });
    expect(step.HTML).toEqual('<p>you should <i class="tour-step-best-practices"></i> take note</p>\n');
  });

  it('calculates visibility', () => {
    expect(step.isViewable).toBe(true);
    step.anchor_id = '1234';
    expect(step.isViewable).toBe(false);
    jest.spyOn(document, 'querySelector').mockImplementation(() => true);
    expect(step.target).toBeTruthy();
    expect(step.element).toBeTruthy();
    expect(document.querySelector).toHaveBeenCalledWith(step.target);
    expect(step.isViewable).toBe(true);
  });

});
