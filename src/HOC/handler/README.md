The `handler` higher-order-component is at the core of Freeform, and handles tracking values and triggering renders of the appropriate components. The only requirements are that you use a class, and that you have a `getDefaults()` method that returns an object of default values.

```jsx static
import handler from 'react-freeform/HOC/handler/';

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return {
      some: 'Hello',
      fields: 'World',
    };
  }
}

export default handler(MyFormBase);
```

### Rendering content

You can add your form contents inside of the `render()`, or pass them in as children:

```jsx
const Field = require('react-freeform/components/Field/').default;
const handler = require('react-freeform/HOC/handler/').default;

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return {
      some: 'Hello',
      fields: 'World',
    };
  }
}

const MyForm = handler(MyFormBase);

<MyForm>
  <Field name="some" />
  <Field name="fields" />
</MyForm>
```

You can also override `render()` to provide content, however the default is to
render children, and common practice is to pass it children as shown above.

#### formProps()

`formProps()` should return an object of props to spread onto the main `<form>`

```jsx
const Field = require('react-freeform/components/Field/').default;
const handler = require('react-freeform/HOC/handler/').default;

class MyFormBase extends React.PureComponent {
  getDefaults() {
    return {
      some: 'Hello',
      fields: 'World',
    };
  }

  formProps() {
    return {
      style: { background: '#ccc', padding: '20px' },
    }
  }
}

const MyForm = handler(MyFormBase);

<MyForm>
  <Field name="some" />
  <Field name="fields" />
</MyForm>
```
