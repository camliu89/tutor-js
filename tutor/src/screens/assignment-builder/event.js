import {
  React, PropTypes, observer, cn,
} from '../../helpers/react';
import { Card } from 'react-bootstrap';
import Header from './header';
import PlanFooter from './footer';
import TaskPlanBuilder from './builder';
import Wrapper from './wrapper';
import UX from './ux';

const Event = observer(({ ux, ux: { plan } }) => (
  <Wrapper ux={ux}>
    <Card
      className={cn('edit-event', 'dialog', { 'is-invalid-form': ux.hasError })}
    >
      <Header plan={plan} onCancel={ux.onCancel} label="" />
      <Card.Body>
        <TaskPlanBuilder ux={ux} />
      </Card.Body>
      <PlanFooter ux={ux} />
    </Card>
  </Wrapper>
));

Event.displayName = 'Event';
Event.propTypes = {
  ux: PropTypes.instanceOf(UX).isRequired,
};

export default Event;
