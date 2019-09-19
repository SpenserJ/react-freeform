# react-freeform

[![Build Status](https://travis-ci.org/SpenserJ/react-freeform.svg?branch=master)](https://travis-ci.org/SpenserJ/react-freeform)
[![codecov](https://codecov.io/gh/SpenserJ/react-freeform/branch/master/graph/badge.svg)](https://codecov.io/gh/SpenserJ/react-freeform)
[![npm](https://img.shields.io/npm/v/react-freeform.svg)](https://www.npmjs.com/package/react-freeform)

The goal of Freeform is to provide an unopinionated framework for building forms,
without manually passing values and onChange events. There are only 3 decisions
that have been made that limit your freedom, and all of them have workarounds if
they impede your project.

* You must know the default values before the form is rendered
* You may not change the type of a value after it has been set
  * Changing from an `object` to a `string` is usually a sign of data integrity problems
  * `<input>` forces values to be a string, but if a value was previously a number, Freeform will attempt to typecast it back into one
* Your form must support an object of values.
  * If you're building a form with a single value, you probably don't need this library
  * If you're building an array of values, you will need to put it in an object first and access it during the submit

Beyond these limitations, Freeform tries to let you write your form however you please.
You can build a form that uses 2005-style `POST` submissions, GraphQL, WebSockets,
or anything else you can imagine. Any component's render can be overridden, and Freeform
can work with any input field available, often out of the box.

## Installation

React Freeform requires **React 16.0 or later**.

```shell
npm install --save react-freeform
```

## Documentation

* [Higher Order Components](http://spenserj.com/react-freeform/#!/Higher%20Order%20Components)
* [Form Components](http://spenserj.com/react-freeform/#!/Form%20Components)

## License

MIT
