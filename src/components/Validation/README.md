Validation accepts its rules in multiple formats, and will receive the values at
this level or lower:

* A single function - Value at this level
* An array of functions - Value at this level
* An object of functions - The value at a lower level, based on the key
* An object of arrays of functions - The value at a lower level, based on the key

This allows you to write multiple validators that can apply to whatever values are
necessary.

```js
const valid = require('react-freeform/HOC/valid').default;
const Form = valid(require('../../../examples/wrapper').default);
<Form defaultValues={{ myField: '', password: '', password2: '', arrayOfRules: -2 }}>
  <Field name="myField" />
  <Validation
    name="myField"
    rules={(value, invalidate) => {
      if (!value) { invalidate('Cannot be empty'); }
    }}
  />
  <br />
  <Field name="password" />
  <Field name="password2" />
  <Validation
    rules={(value, invalidate) => {
      if (!value.password) { invalidate('Cannot be empty'); }
      if (value.password !== value.password2) { invalidate('Passwords must match'); }
    }}
  />
  <br />
  <Field name="arrayOfRules" type="number" />
  <Validation
    name="arrayOfRules"
    rules={[
      (value, invalidate) => { if (value < 0) invalidate('Cannot be negative'); },
      (value, invalidate) => { if (value < 2) invalidate('Cannot be less than 2'); },
    ]}
  />
</Form>
```

You can wrap any content in the Validation, and if there is a name it will nest
the children's values. You can also control whether the errors appear before or after.

```js
const valid = require('react-freeform/HOC/valid').default;
const Form = valid(require('../../../examples/wrapper').default);
<Form defaultValues={{ myField: 'Hello World' }}>
  <Validation
    name="myField"
    rules={(value, invalidate) => {
      if (value.toLowerCase() !== value) { invalidate('Must be lowercase'); }
    }}
    displayBeforeChildren
  >
    <Field />
  </Validation>
</Form>
```
