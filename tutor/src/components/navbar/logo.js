import {
  React, PropTypes, inject, observer, styled,
} from 'vendor';
import TutorLink from '../link';
import Course from '../../models/course';

const TutorLogo = styled.svg`
display: inline-block;
margin-top: 5px;
height: 34px;
width: 200px;
`;

const Logo = inject('courseContext')(observer(({ courseContext: { course } }) => {

  const body = (
    <TutorLogo viewBox="0 0 264.62 40.7">
      <defs>
        <style>
        </style>
      </defs>
      <g id="prefix__Layer_2" data-name="Layer 2">
        <g id="prefix__Layer_1-2" data-name="Layer 1">
          <path
            d="M64.85 9a2.12 2.12 0 0 1-2.22 2L13.16 8.63a2.12 2.12 0 0 1-2-2.22L11.35 2a2.12 2.12 0 0 1 2.22-2L63 2.35a2.12 2.12 0 0 1 2 2.22z"
            fill="#78b042"
          />
          <rect
            fill="#5f6062"
            x={5.81}
            y={17.47}
            width={42.78}
            height={8.83}
            rx={1.27}
            ry={1.27}
          />
          <path
            d="M61 31.83a1.25 1.25 0 0 1-1.19 1.31l-45.4 1.42a1.25 1.25 0 0 1-1.27-1.23L13 29.59a1.25 1.25 0 0 1 1.19-1.31l45.4-1.42a1.25 1.25 0 0 1 1.27 1.23z"
            fill="#f4cf1c"
          />
          <path
            d="M54.87 39.43a1.23 1.23 0 0 1-1.2 1.27H10.34a1.23 1.23 0 0 1-1.2-1.27v-2.5a1.24 1.24 0 0 1 1.2-1.27h43.33a1.24 1.24 0 0 1 1.2 1.27z"
            fill="#242f66"
          />
          <path
            fill="#f47641"
            d="M56 14.45c0 .52-.77.94-1.71.94H1.71C.77 15.38 0 15 0 14.45v-2c0-.52.77-.94 1.71-.94h52.56c.95 0 1.71.42 1.71.94z"
          />
          <path
            fill="#5f6062"
            d="M80.41 16.36A5.35 5.35 0 0 1 86 21.91a5.55 5.55 0 1 1-11.09 0 5.35 5.35 0 0 1 5.5-5.55zm0 9.86a4.09 4.09 0 0 0 4.18-4.31 4.18 4.18 0 1 0-8.35 0 4.09 4.09 0 0 0 4.17 4.31zM88.72 16.64h1.37v1.85a4.86 4.86 0 0 1 4.22-2.12 5.35 5.35 0 0 1 5.55 5.54 5.35 5.35 0 0 1-5.55 5.55 4.86 4.86 0 0 1-4.22-2.12v7.05h-1.37zm5.64 9.58a4.09 4.09 0 0 0 4.18-4.31 4.09 4.09 0 0 0-4.18-4.31 4.31 4.31 0 1 0 0 8.63zM112.27 25.2a5.18 5.18 0 0 1-4.56 2.26c-3.22 0-5.34-2.3-5.34-5.57a5.24 5.24 0 0 1 5.27-5.52 4.79 4.79 0 0 1 5 4.93v1h-8.86a3.93 3.93 0 0 0 4 4 4.24 4.24 0 0 0 3.54-1.87zm-1-4.18a3.55 3.55 0 0 0-3.65-3.42 3.91 3.91 0 0 0-3.88 3.4zM115.65 19.6c0-.78-.12-2.42-.12-3h1.37c0 .77 0 1.64.09 1.85h.07a3.94 3.94 0 0 1 3.61-2.12c3.29 0 4 2.24 4 4.54v6.28h-1.37V21c0-1.71-.48-3.38-2.65-3.38S117 19 117 21.91v5.27h-1.37zM133.91 19.26a2.49 2.49 0 0 0-2.15-1.12c-.73 0-1.6.34-1.6 1.16 0 2 5.91.37 5.91 4.63 0 2.6-2.49 3.51-4.72 3.51a5.36 5.36 0 0 1-4.27-1.69l1.83-1.71a3.36 3.36 0 0 0 2.6 1.35c.8 0 1.83-.39 1.83-1.26 0-2.26-5.91-.48-5.91-4.66 0-2.44 2.19-3.54 4.4-3.54a4.74 4.74 0 0 1 3.9 1.67zM136.92 18.55v-2.32h2.26v-3.18h2.74v3.17h3v2.33h-3v4.79c0 1.1.32 1.78 1.53 1.78a2.84 2.84 0 0 0 1.48-.34v2.31a5.78 5.78 0 0 1-2.17.37c-2.9 0-3.58-1.3-3.58-3.88v-5zM153.93 25.68h-.07a3.94 3.94 0 0 1-3.51 1.78c-2 0-4-1.12-4-3.29 0-3.56 4.15-3.81 6.89-3.81h.69v-.3c0-1.35-1.05-2.05-2.51-2.05a4.31 4.31 0 0 0-2.92 1.14l-1.44-1.44a6.42 6.42 0 0 1 4.65-1.71c4.68 0 4.68 3.38 4.68 4.93v6.3h-2.46zm-.16-3.4h-.57c-1.51 0-4.11.11-4.11 1.69 0 1 1 1.44 1.92 1.44 1.87 0 2.76-1 2.76-2.51zM162.17 21.29l-3.79-5.07h3.33l2.19 3.29 2.37-3.29h3.13l-3.74 5.07 4.4 5.89h-3.33l-2.85-3.93-2.88 3.93h-3.24z"
          />
          <path
            fill="#f47641"
            d="M186.42 17.41h-3.62v9.73h-1.3v-9.73h-3.61v-1.2h8.53zM196.7 23a6.31 6.31 0 0 1-.22 1.7 3.94 3.94 0 0 1-.71 1.41 3.44 3.44 0 0 1-1.27 1 5.24 5.24 0 0 1-3.83 0 3.43 3.43 0 0 1-1.27-1 3.94 3.94 0 0 1-.71-1.41 6.31 6.31 0 0 1-.22-1.7v-6.79h1.3v6.58a5.85 5.85 0 0 0 .14 1.28 3.18 3.18 0 0 0 .46 1.1 2.34 2.34 0 0 0 .86.76 3.38 3.38 0 0 0 2.72 0 2.35 2.35 0 0 0 .86-.76 3.19 3.19 0 0 0 .46-1.1 5.85 5.85 0 0 0 .14-1.28v-6.58h1.3zM207.27 17.41h-3.61v9.73h-1.3v-9.73h-3.61v-1.2h8.53zM214.43 27.42a5.92 5.92 0 0 1-2.29-.43 5.5 5.5 0 0 1-1.81-1.2 5.39 5.39 0 0 1-1.19-1.79 6.41 6.41 0 0 1 0-4.59 5.39 5.39 0 0 1 1.19-1.82 5.52 5.52 0 0 1 1.81-1.2 6.3 6.3 0 0 1 4.59 0 5.52 5.52 0 0 1 1.81 1.2 5.39 5.39 0 0 1 1.19 1.82 6.41 6.41 0 0 1 0 4.59 5.39 5.39 0 0 1-1.19 1.82 5.5 5.5 0 0 1-1.81 1.2 5.92 5.92 0 0 1-2.3.4zm0-1.2a4.25 4.25 0 0 0 1.75-.35 4.14 4.14 0 0 0 1.37-1 4.46 4.46 0 0 0 .89-1.44 5.1 5.1 0 0 0 0-3.54 4.45 4.45 0 0 0-.89-1.44 4.14 4.14 0 0 0-1.37-1 4.51 4.51 0 0 0-3.51 0 4.14 4.14 0 0 0-1.37 1 4.45 4.45 0 0 0-.89 1.44 5.1 5.1 0 0 0 0 3.54 4.46 4.46 0 0 0 .89 1.44 4.14 4.14 0 0 0 1.37 1 4.25 4.25 0 0 0 1.76.35zM222.79 16.21h2.8a13.33 13.33 0 0 1 1.57.09 4.21 4.21 0 0 1 1.4.4 2.54 2.54 0 0 1 1 .9 2.94 2.94 0 0 1 .39 1.61 2.66 2.66 0 0 1-.73 1.95 3.46 3.46 0 0 1-2 .94l3.1 5h-1.59l-3-4.91h-1.67v4.91h-1.3zm1.3 4.82H226.37a3.83 3.83 0 0 0 1.07-.2 1.85 1.85 0 0 0 .8-.53 1.54 1.54 0 0 0 .32-1 1.7 1.7 0 0 0-.23-.94 1.56 1.56 0 0 0-.61-.55 2.58 2.58 0 0 0-.85-.25 7.22 7.22 0 0 0-.95-.06h-1.82zM259.72 16.9h-.87v-.44H261v.44h-.87v2.32h-.44zm1.87-.44h.7l.82 2.1.83-2.1h.68v2.76h-.44V16.9l-.91 2.32H263l-1-2.32v2.32h-.44zM236.09 16.12h1l-.56 4a2.61 2.61 0 0 1 2-.91 2.27 2.27 0 0 1 2.38 2.79 3.15 3.15 0 0 1-3.13 2.82 1.94 1.94 0 0 1-1.73-.91l-.11.77h-1zm3.73 5.88a1.47 1.47 0 0 0-1.5-1.87 2.05 2.05 0 0 0-2 1.87 1.48 1.48 0 0 0 1.51 1.87 2 2 0 0 0 1.99-1.87zM242.92 22.38c-.14.94.65 1.56 1.59 1.56a2.17 2.17 0 0 0 1.59-.8l.69.59a3.26 3.26 0 0 1-2.54 1.1 2.28 2.28 0 0 1-2.38-2.83 3.23 3.23 0 0 1 3.13-2.82c1.89 0 2.41 1.45 2.22 2.83v.36zm3.33-.82a1.25 1.25 0 0 0-1.34-1.56 2 2 0 0 0-1.91 1.56zM251.63 20.2h-1.46l-.35 2.44c-.08.6-.17 1.24.6 1.24a1.57 1.57 0 0 0 .75-.16l-.13.93a2.56 2.56 0 0 1-1 .18c-1.58 0-1.46-1-1.34-1.82l.4-2.8H248l.12-.88h1.18l.2-1.51h1l-.2 1.51h1.46zM253 20a3.62 3.62 0 0 1 2.24-.79c1.59 0 2.13.86 2 1.79l-.38 2.74a8.46 8.46 0 0 0-.09 1h-.91c0-.27 0-.54.08-.82a2.38 2.38 0 0 1-2 1c-1 0-1.78-.57-1.63-1.61.19-1.38 1.59-1.86 3.22-1.86h.75v-.23c.08-.56-.25-1.13-1.12-1.13a2.53 2.53 0 0 0-1.61.61zm2.58 2.13c-1 0-2.16.17-2.29 1-.08.61.33.87 1 .87a1.72 1.72 0 0 0 1.76-1.56v-.34z"
          />
        </g>
      </g>
    </TutorLogo>

  );

  if (!course || !course.currentRole.isTeacherStudent) {
    return (
      <TutorLink to="myCourses" className="brand" aria-label="dashboard">
        {body}
      </TutorLink>
    );
  }
  return body;
}));

Logo.displayName = 'Logo';

Logo.propTypes = {
  course: PropTypes.instanceOf(Course),
};

export { Logo };
